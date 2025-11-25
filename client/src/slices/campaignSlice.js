import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import http from '../api/http';

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
      // Get
      .addCase(fetchCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default campaignSlice.reducer;

export const selectCampaign = (state) => state.campaign.data;
export const selectCampaignLoading = (state) => state.campaign.loading;
export const selectCampaignError = (state) => state.campaign.error;
