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
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'שגיאה');
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
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'שגיאה');
    }
  }
);

// עדכון קמפיין (תיאור וכו')
export const updateCampaign = createAsyncThunk(
  'campaign/updateCampaign',
  async ({ campaignId, payload }, thunkAPI) => {
    try {
      const { data } = await http.put(`/campaigns/${campaignId}`, payload);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'שגיאה');
    }
  }
);

// ===== פוסטים =====

// הוספת פוסט
export const addPost = createAsyncThunk(
  'campaign/addPost',
  async ({ campaignId, post }, thunkAPI) => {
    try {
      const { data } = await http.put(
        `/campaigns/${campaignId}/posts`,
        post
      );
      // השרת מחזיר את הקמפיין המלא
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'שגיאה');
    }
  }
);

// עדכון פוסט
export const updatePost = createAsyncThunk(
  'campaign/updatePost',
  async ({ campaignId, postId, post }, thunkAPI) => {
    try {
      const { data } = await http.put(
        `/campaigns/${campaignId}/posts/${postId}`,
        post
      );
      // השרת מחזיר את הקמפיין המלא
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'שגיאה');
    }
  }
);

// מחיקת פוסט
export const deletePost = createAsyncThunk(
  'campaign/deletePost',
  async ({ campaignId, postId }, thunkAPI) => {
    try {
      const { data } = await http.delete(
        `/campaigns/${campaignId}/posts/${postId}`
      );
      // השרת מחזיר את הקמפיין המלא
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'שגיאה');
    }
  }
);

// ===== גלריית תמונות =====

// הוספת תמונה לגלריה
export const addImage = createAsyncThunk(
  'campaign/addImage',
  async ({ campaignId, imageUrl }, thunkAPI) => {
    try {
      const { data } = await http.put(`/campaigns/${campaignId}/gallery`, {
        imageUrl,
      });
      // השרת מחזיר את הקמפיין המלא
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'שגיאה');
    }
  }
);

// מחיקת תמונה מהגלריה
export const deleteImage = createAsyncThunk(
  'campaign/deleteImage',
  async ({ campaignId, imageUrl }, thunkAPI) => {
    try {
      const { data } = await http.delete(`/campaigns/${campaignId}/gallery`, {
        data: { imageUrl },
      });
      // השרת מחזיר את הקמפיין המלא
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'שגיאה');
    }
  }
);

// ===== צפיות =====

// הגדלת viewCount בקמפיין
export const incrementView = createAsyncThunk(
  'campaign/incrementView',
  async (campaignId, thunkAPI) => {
    try {
      const { data } = await http.post(`/campaigns/${campaignId}/view`);
      // השרת מחזיר את הקמפיין המלא עם viewCount מעודכן
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || 'שגיאה');
    }
  }
);

// ===== AI – הצעת פוסט אוטומטית =====
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
      return data.suggestion; // { title, content }
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || err.message || 'שגיאה'
      );
    }
  }
);


// ===== Slice =====
const campaignSlice = createSlice({
  name: 'campaign',
  initialState: {
    loading: false,
    data: null,       // הקמפיין
    candidate: null,  // המועמד של הקמפיין
    error: null,

    aiLoading: false,
    aiError: null,
    aiSuggestion: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.campaign;       // הקמפיין עצמו
        state.candidate = action.payload.candidate; // המועמד
      })
      .addCase(fetchCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update description (או עדכון כללי של קמפיין)
      .addCase(updateCampaign.fulfilled, (state, action) => {
        state.data = action.payload;
      })

      // Posts
      .addCase(addPost.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.data = action.payload;
      })

      // Gallery
      .addCase(addImage.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(deleteImage.fulfilled, (state, action) => {
        state.data = action.payload;
      })

      // Views
      .addCase(incrementView.fulfilled, (state, action) => {
        state.data = action.payload; // viewCount מעודכן מגיע מהשרת
      })

      // AI suggestion
      .addCase(generatePostSuggestion.pending, (state) => {
        state.aiLoading = true;
        state.aiError = null;
        state.aiSuggestion = null;
      })
      .addCase(generatePostSuggestion.fulfilled, (state, action) => {
        state.aiLoading = false;
        state.aiSuggestion = action.payload; // { title, content }
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
