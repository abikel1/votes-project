import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

// ===== Thunks =====

// שליפת קמפיין לפי מזהה מועמד
export const fetchCampaign = createAsyncThunk(
  'campaign/fetchCampaign',
  async (candidateId, thunkAPI) => {
    try {
      const { data } = await http.get(`/campaigns/candidate/${candidateId}`);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'שגיאה בטעינת הקמפיין'
      );
    }
  }
);

// יצירת קמפיין חדש למועמד
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

// עדכון קמפיין
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

// ===== פוסטים =====

export const addPost = createAsyncThunk(
  'campaign/addPost',
  async ({ campaignId, post }, thunkAPI) => {
    try {
      const { data } = await http.put(
        `/campaigns/${campaignId}/posts`,
        post
      );
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

// 🆕 ===== תגובות =====

export const addComment = createAsyncThunk(
  'campaign/addComment',
  async ({ campaignId, postId, content }, thunkAPI) => {
    console.log(localStorage.getItem('token'));

    try {
      const token = localStorage.getItem('token'); // 🔑
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

// ===== גלריית תמונות =====

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

// ===== צפיות =====

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

// ===== AI =====

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

// ===== Slice =====

const initialState = {
  loading: false,
  data: null,
  candidate: null,
  error: null,

  aiLoading: false,
  aiError: null,
  aiSuggestion: null,
};

const campaignSlice = createSlice({
  name: 'campaign',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ----- Fetch campaign -----
      .addCase(fetchCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.campaign;
        state.candidate = action.payload.candidate;
      })
      .addCase(fetchCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'שגיאה בטעינת הקמפיין';
      })

      // ----- Create campaign -----
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ----- Update campaign -----
      .addCase(updateCampaign.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(updateCampaign.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ----- Posts -----
      .addCase(addPost.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(addPost.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload;
      })

      // 🆕 ----- Comments -----
      .addCase(addComment.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ----- Gallery -----
      .addCase(addImage.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(addImage.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.data = action.payload;
        state.error = null;
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ----- Views -----
      .addCase(incrementView.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(incrementView.rejected, (state, action) => {
        state.error = action.payload;
      })

      // ----- AI suggestion -----
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

export default campaignSlice.reducer;

// Selectors
export const selectCampaign = (state) => state.campaign.data || null;
export const selectCandidate = (state) => state.campaign.candidate || null;
export const selectCampaignLoading = (state) => state.campaign.loading;
export const selectCampaignError = (state) => state.campaign.error;

export const selectAiSuggestion = (state) => state.campaign.aiSuggestion;
export const selectAiLoading = (state) => state.campaign.aiLoading;
export const selectAiError = (state) => state.campaign.aiError;