export namespace API {
  export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
  }

  export interface CurrentUser {
    uuid: string;
    username: string;
    email: string | null;
    avatar_url: string | null;
    nickname: string;
    real_name: string;
    class: string;
    class_type: string;
    joined_at: string;
    current_status: string;
    last_login_at: string;
    score: number;
    user_role: string;
    title: string | null;
    invited_by: string | null;
    views: number;
    is_verified: boolean;
  }

  export interface SheetQuestion {
    uuid: string;
    question: string;
  }

  export interface SheetResponse {
    sheet_id: string;
    questions: SheetQuestion[];
  }

  export interface Answer {
    question_uuid: string;
    answer: string;
  }

  export interface RegisterRequest {
    nickname: string;
    real_name: string;
    classtype: string;
    class: string;
    sheet_id: string;
    answers: Answer[];
  }

  export interface RegisterResponse {
    temp_token: string;
    token_type: string;
    expires_in: number;
    user: {
      uuid: string;
      nickname: string;
      real_name: string;
      class: string;
      class_type: string;
      role: string;
      is_verified: boolean;
      status: string;
    };
  }

  export interface RegisterCompleteRequest {
    username: string;
    password: string;
    email?: string | null;
  }

  export interface RegisterCompleteResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: CurrentUser;
  }

  export interface LogoutRequest {
    refresh_token: string;
  }

  export interface LogoutResponse {
    message: string;
  }

  export interface ApiError {
    detail: string;
  }
}
