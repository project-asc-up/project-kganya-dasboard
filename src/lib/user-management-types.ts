export type UserAccessActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialUserAccessActionState: UserAccessActionState = {
  status: "idle",
  message: "",
};

export const initialUserInviteActionState: UserAccessActionState = {
  status: "idle",
  message: "",
};
