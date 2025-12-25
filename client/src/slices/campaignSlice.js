import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

export const fetchCampaign = createAsyncThunk(
  'campaign/fetchCampaign',
  async (candidateId, thunkAPI) => {
    try {
      const { data } = await http.get(`/campaigns/candidate/${candidateId}`);
      return data;
    } catch (err) {
      const status = err.response?.status;
      const code = err.response?.data?.code;
      const message =
        err.response?.data?.message || 'שגיאה בטעינת הקמפיין';
      const groupId = err.response?.data?.groupId;

      return thunkAPI.rejectWithValue({ status, code, message, groupId });
    }
  }
);

export const createCampaign = createAsyncThunk(
  'campaign/createCampaign',
  async ({ candidateId, payload }, thunkAPI) => {
    try {
      const { data } = await http.post(
        `/campaigns/candidate/${candidateId}`,
        payload
      );
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'שגיאה ביצירת קמפיין'
      );
    }
  }
);

export const updateCampaign = createAsyncThunk(
  'campaign/updateCampaign',
  async ({ campaignId, payload }, thunkAPI) => {
    try {
      const { data } = await http.put(`/campaigns/${campaignId}`, payload);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'שגיאה בעדכון קמפיין'
      );
    }
  }
);

export const addPost = createAsyncThunk(
  'campaign/addPost',
  async ({ campaignId, post }, thunkAPI) => {
    try {
      const { data } = await http.put(`/campaigns/${campaignId}/posts`, post);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'שגיאה בהוספת פוסט'
      );
    }
  }
);

export const updatePost = createAsyncThunk(
  'campaign/updatePost',
  async ({ campaignId, postId, post }, thunkAPI) => {
    try {
      const { data } = await http.put(
        `/campaigns/${campaignId}/posts/${postId}`,
        post
      );
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'שגיאה בעדכון פוסט'
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  'campaign/deletePost',
  async ({ campaignId, postId }, thunkAPI) => {
    try {
      const { data } = await http.delete(
        `/campaigns/${campaignId}/posts/${postId}`
      );
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'שגיאה במחיקת פוסט'
      );
    }
  }
);

export const addComment = createAsyncThunk(
  'campaign/addComment',
  async ({ campaignId, postId, content }, thunkAPI) => {
    try {
      const token = localStorage.getItem('token');

      const { data } = await http.post(
        `/campaigns/${campaignId}/posts/${postId}/comments`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'שגיאה בהוספת תגובה'
      );
    }
  }
);

export const deleteComment = createAsyncThunk(
  'campaign/deleteComment',
  async ({ campaignId, postId, commentId }, thunkAPI) => {
    try {
      const { data } = await http.delete(
        `/campaigns/${campaignId}/posts/${postId}/comments/${commentId}`
      );
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'שגיאה במחיקת תגובה'
      );
    }
  }
);

export const addImage = createAsyncThunk(
  'campaign/addImage',
  async ({ campaignId, imageUrl }, thunkAPI) => {
    try {
      const { data } = await http.put(`/campaigns/${campaignId}/gallery`, {
        imageUrl,
      });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'שגיאה בהוספת תמונה'
      );
    }
  }
);

export const deleteImage = createAsyncThunk(
  'campaign/deleteImage',
  async ({ campaignId, imageUrl }, thunkAPI) => {
    try {
      const { data } = await http.delete(`/campaigns/${campaignId}/gallery`, {
        data: { imageUrl },
      });
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'שגיאה במחיקת תמונה'
      );
    }
  }
);

export const incrementView = createAsyncThunk(
  'campaign/incrementView',
  async (campaignId, thunkAPI) => {
    try {
      const { data } = await http.post(`/campaigns/${campaignId}/view`);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'שגיאה בעדכון צפיות'
      );
    }
  }
);

export const generatePostSuggestion = createAsyncThunk(
  'campaign/generatePostSuggestion',
  async ({ candidateId, titleHint, note }, thunkAPI) => {
    try {
      const { data } = await http.post(
        `/campaigns/candidate/${candidateId}/ai-suggest-post`,
        { titleHint, note }
      );
      if (!data.ok) {
        throw new Error(data.message || 'שגיאה מה-AI');
      }
      return data.suggestion;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || 'שגיאה מה-AI'
      );
    }
  }
);

export const toggleLike = createAsyncThunk(
  'campaign/toggleLike',
  async (campaignId, thunkAPI) => {
    const state = thunkAPI.getState();
    const hasLiked = state.campaign.data?.liked;

    if (hasLiked) {
      const { data } = await http.post(`/campaigns/${campaignId}/unlike`);
      return data;
    } else {
      const { data } = await http.post(`/campaigns/${campaignId}/like`);
      return data;
    }
  }
);

export const fetchCampaignBySlug = createAsyncThunk(
  'campaign/fetchCampaignBySlug',
  async ({ groupSlug, candidateSlug }, thunkAPI) => {
    try {
      const { data } = await http.get(
        `/campaigns/by-slug/${groupSlug}/${candidateSlug}`
      );
      return data;
    } catch (err) {
      const status = err.response?.status;
      const code = err.response?.data?.code;
      const message =
        err.response?.data?.message || 'שגיאה בטעינת הקמפיין';
      const groupId = err.response?.data?.groupId;

      return thunkAPI.rejectWithValue({ status, code, message, groupId });
    }
  }
);

const initialState = {
  loading: false,
  data: null,
  candidate: null,
  error: null,
  locked: false,
  lockedGroupId: null,
  aiLoading: false,
  aiError: null,
  aiSuggestion: null,
};

const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {
    clearCampaign(state) {
      state.loading = false;
      state.data = null;
      state.candidate = null;
      state.error = null;
      state.locked = false;
      state.lockedGroupId = null;
      state.aiLoading = false;
      state.aiError = null;
      state.aiSuggestion = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaignBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.locked = false;
        state.lockedGroupId = null;
      })
      .addCase(fetchCampaignBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.campaign;
        state.candidate = action.payload.candidate;
        state.locked = false;
        state.lockedGroupId = null;
      })
      .addCase(fetchCampaignBySlug.rejected, (state, action) => {
        state.loading = false;

        if (action.payload && typeof action.payload === 'object') {
          state.error =
            action.payload.message || 'שגיאה בטעינת הקמפיין';

          state.locked =
            action.payload.code === 'GROUP_LOCKED' ||
            action.payload.status === 403;
          state.lockedGroupId = state.locked
            ? action.payload.groupId || null
            : null;
        } else {
          state.error = action.payload || 'שגיאה בטעינת הקמפיין';
          state.locked = false;
          state.lockedGroupId = null;
        }
      })

      .addCase(fetchCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.locked = false;
        state.lockedGroupId = null;
      })
      .addCase(fetchCampaign.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload || {};
        state.data = payload.campaign || null;
        state.candidate = payload.candidate || null;
        state.locked = false;
        state.lockedGroupId = null;
      })
      .addCase(fetchCampaign.rejected, (state, action) => {
        state.loading = false;

        if (action.payload && typeof action.payload === 'object') {
          state.error =
            action.payload.message || 'שגיאה בטעינת הקמפיין';

          state.locked =
            action.payload.code === 'GROUP_LOCKED' ||
            action.payload.status === 403;
          state.lockedGroupId = state.locked
            ? action.payload.groupId || null
            : null;
        } else {
          state.error = action.payload || 'שגיאה בטעינת הקמפיין';
          state.locked = false;
          state.lockedGroupId = null;
        }
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(addPost.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.data.posts.findIndex(
          (p) => p._id === updatedPost._id
        );

        if (index !== -1) {
          state.data.posts[index] = updatedPost;
        }
      })

      .addCase(deleteComment.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.data.posts.findIndex(
          (p) => p._id === updatedPost._id
        );
        if (index !== -1) {
          state.data.posts[index] = updatedPost;
        }
      })
      .addCase(addImage.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(incrementView.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(incrementView.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(toggleLike.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        state.data.likeCount = action.payload.likeCount;
        state.data.liked = action.payload.liked;
      })
      .addCase(generatePostSuggestion.pending, (state) => {
        state.aiLoading = true;
        state.aiError = null;
        state.aiSuggestion = null;
      })
      .addCase(generatePostSuggestion.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.aiSuggestion = action.payload;
      })
      .addCase(generatePostSuggestion.rejected, (state, action) => {
        state.aiLoading = false;
        state.aiError = action.payload;
      });
  },
});

export const { clearCampaign } = campaignSlice.actions;
export default campaignSlice.reducer;
export const selectCampaign = (state) => state.campaign.data || null;
export const selectCandidate = (state) => state.campaign.candidate || null;
export const selectCampaignLoading = (state) => state.campaign.loading;
export const selectCampaignError = (state) => state.campaign.error;
export const selectCampaignLocked = (state) => state.campaign.locked;
export const selectCampaignLockedGroupId = (state) =>
  state.campaign.lockedGroupId;
export const selectAiSuggestion = (state) => state.campaign.aiSuggestion;
export const selectAiLoading = (state) => state.campaign.aiLoading;
export const selectAiError = (state) => state.campaign.aiError;
