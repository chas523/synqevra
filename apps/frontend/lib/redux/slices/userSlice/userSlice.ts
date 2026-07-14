import { UserService } from "@/lib/services/userServices/userService";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface UserState {
  user: User | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "ADMIN" | "MODERATOR" | "USER";
  tenantId?: string | null;
}

const initialState: UserState = {
  user: null,
  status: "idle",
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserInformations.fulfilled, (state, action) => {
      state.user = action.payload;
      state.status = "succeeded";
      state.error = null;
    });
    builder.addCase(fetchUserInformations.pending, (state) => {
      state.status = "loading";
      state.error = null;
    });
    builder.addCase(fetchUserInformations.rejected, (state, action) => {
      state.status = "failed";
      state.error = action.payload || "Wystąpił nieoczekiwany błąd";
    });
  },
});

export const fetchUserInformations = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("user/fetchInformations", async (_, { rejectWithValue }) => {
  try {
    return await UserService.getProfile();
  } catch (err) {
    //error thrown from service with the message extracted with 'extractErrorMessage' function
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    }
    return rejectWithValue("Wystąpił nieoczekiwany błąd");
  }
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
