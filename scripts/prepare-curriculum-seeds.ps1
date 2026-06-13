$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $repoRoot "University_of_Pretoria_Curriculumn_Data.csv"
$docsDir = Join-Path $repoRoot "docs"

if (-not (Test-Path $sourcePath)) {
  throw "Missing source CSV: $sourcePath"
}

$facultyMap = @{
  "EBIT" = @{
    faculty_code = "EBIT"
    faculty_name = "Faculty of Engineering, Built Environment and Information Technology"
  }
  "EMS" = @{
    faculty_code = "EMS"
    faculty_name = "Faculty of Economic and Management Sciences"
  }
  "SCI" = @{
    faculty_code = "NAS"
    faculty_name = "Faculty of Natural and Agricultural Sciences"
  }
  "HUM" = @{
    faculty_code = "HUM"
    faculty_name = "Faculty of Humanities"
  }
  "MED" = @{
    faculty_code = "FHS"
    faculty_name = "Faculty of Health Sciences"
  }
  "THEO" = @{
    faculty_code = "THR"
    faculty_name = "Faculty of Theology and Religion"
  }
  "EDU" = @{
    faculty_code = "EDU"
    faculty_name = "Faculty of Education"
  }
  "VET" = @{
    faculty_code = "VET"
    faculty_name = "Faculty of Veterinary Science"
  }
  "LAW" = @{
    faculty_code = "LAW"
    faculty_name = "Faculty of Law"
  }
  "GIBS" = @{
    faculty_code = "GIBS"
    faculty_name = "Gordon Institute of Business Science"
  }
}

function Get-QualificationType {
  param(
    [string]$AcademicLevel,
    [string]$Degree
  )

  $degreeValue = if ($null -eq $Degree) { "" } else { $Degree.Trim() }

  if ($degreeValue -like "Adv Dip*") { return "Advanced Diploma" }
  if ($degreeValue -like "Dip*") { return "Diploma" }
  if ($degreeValue -like "B*") { return "Bachelor" }
  if ($AcademicLevel -eq "UGRD") { return "Undergraduate" }
  return "Unknown"
}

function Get-DurationYears {
  param(
    [object[]]$ProgrammeRows
  )

  $yearTokens = $ProgrammeRows |
    ForEach-Object { $_."Prog Year" } |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
    Sort-Object -Unique

  if ($yearTokens.Count -gt 0) {
    return $yearTokens.Count
  }

  return $null
}

function Get-YearLevelSort {
  param(
    [string]$ProgYear,
    [int]$ProgrammeDurationYears
  )

  if ($ProgYear -match '^\d+$') {
    return [int]$ProgYear
  }

  if ($ProgYear -eq "FIN" -and $ProgrammeDurationYears -gt 0) {
    return $ProgrammeDurationYears
  }

  return $null
}

function Get-YearLevelValues {
  param(
    [object[]]$ProgrammeRows
  )

  return $ProgrammeRows |
    ForEach-Object { $_."Prog Year" } |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
    Sort-Object @{ Expression = {
      if ($_ -match '^\d+$') { [int]$_ }
      elseif ($_ -eq "FIN") { 999 }
      else { 500 }
    } }, @{ Expression = { $_ } } -Unique
}

$rows = Import-Csv $sourcePath | Where-Object { $facultyMap.ContainsKey($_.Faculty) }

$programmeRows = foreach ($group in ($rows | Group-Object { $_."Prog Code" })) {
  $first = $group.Group | Select-Object -First 1
  $mappedFaculty = $facultyMap[$first.Faculty]
  $yearValues = Get-YearLevelValues -ProgrammeRows $group.Group
  $durationYears = Get-DurationYears -ProgrammeRows $group.Group

  [pscustomobject]@{
    faculty_code = $mappedFaculty.faculty_code
    faculty_name = $mappedFaculty.faculty_name
    source_faculty_code = $first.Faculty
    programme_code = $first."Prog Code"
    programme_name = $first."Prog Descr"
    degree_name = $first.Degree
    academic_level = $first."Academic Level"
    qualification_type = Get-QualificationType -AcademicLevel $first."Academic Level" -Degree $first.Degree
    programme_credits = $first."Prog Credits"
    duration_years = $durationYears
    year_levels = ($yearValues -join ";")
    source_file = "University_of_Pretoria_Curriculumn_Data.csv"
    last_verified = "2026-06-13"
    notes = if ($first.Faculty -eq "GIBS") { "Curriculum exists in source CSV, but ASC/public support pages were not added to the MVP knowledge set." } else { "" }
  }
}

$programmeDurationMap = @{}
foreach ($programme in $programmeRows) {
  $programmeDurationMap[$programme.programme_code] = [int]$programme.duration_years
}

$moduleRows = foreach ($group in ($rows | Group-Object {
  "{0}|{1}|{2}|{3}|{4}" -f $_."Prog Code", $_."Prog Year", $_.Module, $_."Module Type", $_."Module Units"
})) {
  $first = $group.Group | Select-Object -First 1
  $mappedFaculty = $facultyMap[$first.Faculty]
  $programmeDurationYears = $programmeDurationMap[$first."Prog Code"]

  [pscustomobject]@{
    faculty_code = $mappedFaculty.faculty_code
    source_faculty_code = $first.Faculty
    programme_code = $first."Prog Code"
    programme_name = $first."Prog Descr"
    year_level_raw = $first."Prog Year"
    year_level_sort = Get-YearLevelSort -ProgYear $first."Prog Year" -ProgrammeDurationYears $programmeDurationYears
    module_code = $first.Module
    module_name = ""
    module_type = $first."Module Type"
    module_units = $first."Module Units"
    source_file = "University_of_Pretoria_Curriculumn_Data.csv"
    last_verified = "2026-06-13"
    notes = "Module name not supplied in source CSV; code only."
  }
}

$programmePath = Join-Path $docsDir "seed-programmes.csv"
$modulePath = Join-Path $docsDir "seed-course-modules.csv"

$programmeRows |
  Sort-Object faculty_code, programme_name, programme_code |
  Export-Csv -NoTypeInformation $programmePath

$moduleRows |
  Sort-Object faculty_code, programme_code, year_level_sort, module_code |
  Export-Csv -NoTypeInformation $modulePath

Write-Output ("programmes=" + ($programmeRows | Measure-Object | Select-Object -ExpandProperty Count))
Write-Output ("course_modules=" + ($moduleRows | Measure-Object | Select-Object -ExpandProperty Count))
