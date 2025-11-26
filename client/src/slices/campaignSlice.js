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
const { data } = await http.post(`/campaigns/candidate/${candidateId}`, payload);
return data;
} catch (err) {
return thunkAPI.rejectWithValue(err.response?.data?.message || 'שגיאה');
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
const { data } = await http.put(`/campaigns/${campaignId}/posts`, post);
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
const { data } = await http.put(`/campaigns/${campaignId}/posts/${postId}`, post);
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
const { data } = await http.delete(`/campaigns/${campaignId}/posts/${postId}`);
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
const { data } = await http.put(`/campaigns/${campaignId}/gallery`, { imageUrl });
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
const { data } = await http.delete(`/campaigns/${campaignId}/gallery`, { data: { imageUrl } });
return data;
} catch (err) {
return thunkAPI.rejectWithValue(err.response?.data?.message || 'שגיאה');
}
}
);

// ===== Slice =====
const campaignSlice = createSlice({
name: 'campaign',
initialState: {
loading: false,
data: null,
error: null,
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
      state.data = action.payload; // ← כולל campaign + candidate בתוכו
    })
    .addCase(fetchCampaign.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })

    // Update description
    .addCase(updateCampaign.fulfilled, (state, action) => {
      if (state.data) state.data.description = action.payload.description;
    })

    // Posts
    .addCase(addPost.fulfilled, (state, action) => {
      state.data?.posts?.push(action.payload.post);
    })
    .addCase(updatePost.fulfilled, (state, action) => {
      const updatedPost = action.payload;
      state.data.posts = state.data.posts.map(p =>
        p._id === updatedPost._id ? updatedPost : p
      );
    })
    .addCase(deletePost.fulfilled, (state, action) => {
      const postId = action.meta.arg.postId;
      state.data.posts = state.data.posts.filter(p => p._id !== postId);
    })

    // Gallery
    .addCase(addImage.fulfilled, (state, action) => {
      state.data?.gallery?.push(action.payload.imageUrl);
    })
    .addCase(deleteImage.fulfilled, (state, action) => {
      const imageUrl = action.meta.arg.imageUrl;
      state.data.gallery = state.data.gallery.filter(url => url !== imageUrl);
    });
},

});

export default campaignSlice.reducer;

export const selectCampaign = (state) => state.campaign.data?.campaign || null;
export const selectCandidate = (state) => state.campaign.data?.candidate || null;

export const selectCampaignLoading = (state) => state.campaign.loading;
export const selectCampaignError = (state) => state.campaign.error;
