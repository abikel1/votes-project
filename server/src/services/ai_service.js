const { GoogleGenerativeAI } = require('@google/generative-ai');
const Candidate = require('../models/candidate_model');
const Group = require('../models/group_model');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateCampaignPostForCandidate(candidateId, options = {}) {
    const { titleHint, note } = options;

    const candidate = await Candidate.findById(candidateId).populate('groupId');
    if (!candidate) throw new Error('Candidate not found');

    const groupName = candidate.groupId?.name || '';
    const candidateName = candidate.name;
    const candidateDescription = candidate.description || '';

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash', // או המודל שבו את משתמשת
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
   להשתמש במילים כמו "אני", "אנחנו" וכדומה — לא לכתוב "הוא/היא" או "המועמד/ת".
2. לשמור על טון חיובי, מכבד, וחברי.
3. לשלב אימוג'ים מתאימים לאורך הטקסט (בערך 2–6), בצורה טבעית ולא מוגזמת.
4. הפוסט צריך להתאים לקבוצה/קהילה ולקריאה בוואטסאפ.

תפקידך: להציע פוסט קמפיין אחד (כותרת + תוכן) בעברית, לפי ההנחיות.

החזר תשובה בפורמט JSON בלבד, בלי טקסט נוסף מסביב:
{
  "title": "כותרת לפוסט",
  "content": "תוכן הפוסט..."
}
  `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text() || '';

    let json;
    try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
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
