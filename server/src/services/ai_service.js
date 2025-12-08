// server/src/services/ai_service.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Candidate = require('../models/candidate_model');

// אותו פטנט כמו בקבוצות – עם בדיקת KEY
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

async function generateCampaignPostForCandidate(candidateId, options = {}) {
  const { titleHint, note } = options || {};

  const candidate = await Candidate.findById(candidateId).populate('groupId');
  if (!candidate) throw new Error('Candidate not found');

  const groupName = candidate.groupId?.name || '';
  const candidateName = candidate.name;
  const candidateDescription = candidate.description || '';

  // ❗ אם אין מפתח / אין genAI – מחזירים פוסט "ידני" ולא נופלים לשגיאה
  if (!genAI || !process.env.GEMINI_API_KEY) {
    return {
      title: titleHint || `פוסט קמפיין עבור ${candidateName}`,
      content:
        note ||
        `אני ${candidateName} ומתמודד/ת בקבוצה "${groupName}". ${candidateDescription}`,
    };
  }

  // משתמשים באותו מודל שעובד לך בתיאור קבוצה
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
  });

  let extra = '';
  if (titleHint) {
    extra += `\nיש כותרת מוצעת לפוסט. אם היא מתאימה, השתדל לשלב או לשפר אותה:\n"${titleHint}"\n`;
  }
  if (note) {
    extra += `\nהנחיה נוספת לגבי תוכן הפוסט:\n"${note}"\n`;
  }

  const prompt = `
אתה כותב תוכן לקמפיין בחירות בקבוצה ב-whatsapp / קהילה.

פרטי הקבוצה:
שם הקבוצה: "${groupName}"

פרטי המועמד:
שם: "${candidateName}"
תיאור: "${candidateDescription}"

${extra}

הנחיות סגנון חשובות:
1. כתוב את הפוסט **בגוף ראשון**, כאילו אני המועמד/ת שמדבר/ת על עצמי.
2. לשמור על טון חיובי, מכבד, וחברי.
3. לשלב אימוג'ים מתאימים לאורך הטקסט (בערך 2–6), בצורה טבעית ולא מוגזמת.
4. הפוסט צריך להתאים לקבוצה/קהילה ולקריאה בוואטסאפ.

החזר תשובה בפורמט JSON בלבד, בלי טקסט נוסף מסביב:
{
  "title": "כותרת לפוסט",
  "content": "תוכן הפוסט..."
}
  `.trim();

  let text = '';
  try {
    const result = await model.generateContent(prompt);
    text = result.response.text() || '';
  } catch (err) {
    // ❗ אם יש שגיאת quota / 429 / כל דבר אחר – נופלים לפאלבק במקום להחזיר 500
    console.error('AI campaign post error:', err);
    return {
      title: titleHint || `פוסט קמפיין עבור ${candidateName}`,
      content:
        note ||
        candidateDescription ||
        `אני ${candidateName} ומתמודד/ת בקבוצה "${groupName}".`,
    };
  }

  let json;
  try {
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    json = JSON.parse(cleaned);
  } catch (e) {
    json = {
      title: `פוסט קמפיין עבור ${candidateName}`,
      content: text,
    };
  }

  return {
    title: json.title || `פוסט קמפיין עבור ${candidateName}`,
    content: json.content || '',
  };
}

module.exports = {
  generateCampaignPostForCandidate,
};
