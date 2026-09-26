import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'gu' | 'hi';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

export const DAYS_DICT: Record<string, { gu: string; hi: string; en: string }> = {
  'monday': { gu: 'સોમવાર', hi: 'सोमवार', en: 'Monday' },
  'tuesday': { gu: 'મંગળવાર', hi: 'मंगलवार', en: 'Tuesday' },
  'wednesday': { gu: 'બુધવાર', hi: 'बुधवार', en: 'Wednesday' },
  'thursday': { gu: 'ગુરુવાર', hi: 'गुरुवार', en: 'Thursday' },
  'friday': { gu: 'શુક્રવાર', hi: 'शुक्रवार', en: 'Friday' },
  'saturday': { gu: 'શનિવાર', hi: 'शनिवार', en: 'Saturday' },
  'sunday': { gu: 'રવિવાર', hi: 'रविवार', en: 'Sunday' },
  'mon': { gu: 'સોમ', hi: 'सोम', en: 'Mon' },
  'tue': { gu: 'મંગળ', hi: 'मंगल', en: 'Tue' },
  'wed': { gu: 'બુધ', hi: 'बुध', en: 'Wed' },
  'thu': { gu: 'ગુરુ', hi: 'गुरु', en: 'Thu' },
  'fri': { gu: 'શુક્ર', hi: 'शुक्र', en: 'Fri' },
  'sat': { gu: 'શનિ', hi: 'शनि', en: 'Sat' },
  'sun': { gu: 'રવિ', hi: 'रवि', en: 'Sun' },
  'today': { gu: 'આજે', hi: 'आज', en: 'Today' },
  'tomorrow': { gu: 'આવતીકાલે', hi: 'कल', en: 'Tomorrow' },
  'yesterday': { gu: 'ગઈકાલે', hi: 'कल', en: 'Yesterday' },
};

export const MONTHS_DICT: Record<string, { gu: string; hi: string; en: string }> = {
  'january': { gu: 'જાન્યુઆરી', hi: 'जनवरी', en: 'January' },
  'february': { gu: 'ફેબ્રુઆરી', hi: 'फ़रवरी', en: 'February' },
  'march': { gu: 'માર્ચ', hi: 'मार्च', en: 'March' },
  'april': { gu: 'એપ્રિલ', hi: 'अप्रैल', en: 'April' },
  'may': { gu: 'મે', hi: 'मई', en: 'May' },
  'june': { gu: 'જૂન', hi: 'जून', en: 'June' },
  'july': { gu: 'જુલાઈ', hi: 'जुलाई', en: 'July' },
  'august': { gu: 'ઓગસ્ટ', hi: 'अगस्त', en: 'August' },
  'september': { gu: 'સપ્ટેમ્બર', hi: 'सितंबर', en: 'September' },
  'october': { gu: 'ઓક્ટોબર', hi: 'अक्टूबर', en: 'October' },
  'november': { gu: 'નવેમ્બર', hi: 'नवंबर', en: 'November' },
  'december': { gu: 'ડિસેમ્બર', hi: 'दिसंबर', en: 'December' },
  'jan': { gu: 'જાન્યુ', hi: 'जन', en: 'Jan' },
  'feb': { gu: 'ફેબ્રુ', hi: 'फ़र', en: 'Feb' },
  'mar': { gu: 'માર્ચ', hi: 'मार्च', en: 'Mar' },
  'apr': { gu: 'એપ્રિ', hi: 'अप्रै', en: 'Apr' },
  'jun': { gu: 'જૂન', hi: 'जून', en: 'Jun' },
  'jul': { gu: 'જુલાઈ', hi: 'जुला', en: 'Jul' },
  'aug': { gu: 'ઓગ', hi: 'अग', en: 'Aug' },
  'sep': { gu: 'સપ્ટે', hi: 'सित', en: 'Sep' },
  'oct': { gu: 'ઓક્ટો', hi: 'अक्टू', en: 'Oct' },
  'nov': { gu: 'નવે', hi: 'नव', en: 'Nov' },
  'dec': { gu: 'ડિસે', hi: 'दिस', en: 'Dec' },
};

export const SUBJECTS_DICT: Record<string, { gu: string; hi: string }> = {
  'data structures & algorithms': { gu: 'ડેટા સ્ટ્રક્ચર્સ અને અલ્ગોરિધમ્સ', hi: 'डेटा संरचनाएं और एल्गोरिदम' },
  'data structures': { gu: 'ડેટા સ્ટ્રક્ચર્સ', hi: 'डेटा संरचनाएं' },
  'operating systems': { gu: 'ઓપરેટિંગ સિસ્ટમ્સ', hi: 'ऑपरेटिंग सिस्टम' },
  'database management systems': { gu: 'ડેટાબેઝ મેનેજમેન્ટ સિસ્ટમ્સ', hi: 'डेटाबेस प्रबंधन प्रणाली' },
  'computer networks': { gu: 'કમ્પ્યુટર નેટવર્ક્સ', hi: 'कंप्यूटर नेटवर्क' },
  'discrete mathematics': { gu: 'ડિસ્ક્રીટ મેથેમેટિક્સ', hi: 'असतत गणित' },
  'mathematics': { gu: 'ગણિત', hi: 'गणित' },
  'applied mathematics': { gu: 'પ્રાયોગિક ગણિત', hi: 'अनुप्रयुक्त गणित' },
  'engineering mathematics': { gu: 'એન્જિનિયરિંગ ગણિત', hi: 'इंजीनियरिंग गणित' },
  'physics': { gu: 'ભૌતિકવિજ્ઞાન', hi: 'भौतिकी' },
  'applied physics': { gu: 'પ્રાયોગિક ભૌતિકવિજ્ઞાન', hi: 'अनुप्रयुक्त भौतिकी' },
  'chemistry': { gu: 'રસાયણવિજ્ઞાન', hi: 'रसायन विज्ञान' },
  'applied chemistry': { gu: 'પ્રાયોગિક રસાયણવિજ્ઞાન', hi: 'अनुप्रयुक्त रसायन विज्ञान' },
  'biology': { gu: 'જીવવિજ્ઞાન', hi: 'जीव विज्ञान' },
  'python programming': { gu: 'પાયથન પ્રોગ્રામિંગ', hi: 'पायथन प्रोग्रामिंग' },
  'python': { gu: 'પાયથન', hi: 'पायथन' },
  'ai & machine learning': { gu: 'એઆઇ અને મશીન લર્નિંગ', hi: 'एआई और मशीन लर्निंग' },
  'artificial intelligence': { gu: 'આર્ટિફિશિયલ ઇન્ટેલિજન્સ', hi: 'आर्टिफिशियल इंटेलिजेंस' },
  'machine learning': { gu: 'મશીન લર્નિંગ', hi: 'मशीन लर्निंग' },
  'web development': { gu: 'વેબ ડેવલપમેન્ટ', hi: 'वेब डेवलपमेंट' },
  'cloud computing': { gu: 'ક્લાઉડ કમ્પ્યુટિંગ', hi: 'क्लाउड कंप्यूटिंग' },
  'cybersecurity': { gu: 'સાયબર સુરક્ષા', hi: 'साइबर सुरक्षा' },
  'software engineering': { gu: 'સોફ્ટવેર એન્જિનિયરિંગ', hi: 'सॉफ्टवेयर इंजीनियरिंग' },
  'computer science': { gu: 'કમ્પ્યુટર સાયન્સ', hi: 'कंप्यूटर साइंस' },
  'digital logic': { gu: 'ડિજિટલ લોજિક', hi: 'डिजिटल लॉजिक' },
  'digital logic & computer design': { gu: 'ડિજિટલ લોજિક અને કમ્પ્યુટર ડિઝાઇન', hi: 'डिजिटल लॉजिक और कंप्यूटर डिजाइन' },
  'theory of computation': { gu: 'થિયરી ઓફ કોમ્પ્યુટેશન', hi: 'संगणना का सिद्धांत' },
  'calculus': { gu: 'કલનશાસ્ત્ર (કેલ્ક્યુલસ)', hi: 'कलन गणित (कैलकुलस)' },
  'linear algebra': { gu: 'સુરેખ બીજગણિત (રેખીય બીજગણિત)', hi: 'रैखिक बीजगणित' },
};

export const STATUSES_DICT: Record<string, { gu: string; hi: string }> = {
  'on track': { gu: 'યોગ્ય ગતિ પર', hi: 'सही गति पर' },
  'lagging': { gu: 'પાછળ', hi: 'पीछे' },
  'needs attention': { gu: 'ધ્યાન આપવાની જરૂર', hi: 'ध्यान देने की आवश्यकता' },
  'critical': { gu: 'ગંભીર', hi: 'गंभीर' },
  'high': { gu: 'ઉચ્ચ', hi: 'उच्च' },
  'medium': { gu: 'મધ્યમ', hi: 'मध्यम' },
  'low': { gu: 'ઓછું', hi: 'कम' },
  'pending': { gu: 'બાકી', hi: 'लंबित' },
  'in progress': { gu: 'પ્રગતિમાં', hi: 'प्रगति पर' },
  'completed': { gu: 'પૂર્ણ', hi: 'पूर्ण' },
  'cleared': { gu: 'સમાપ્ત', hi: 'समाप्त' },
  'active': { gu: 'સક્રિય', hi: 'सक्रिय' },
  'active now': { gu: 'હાલ સક્રિય', hi: 'अभी सक्रिय' },
  'done': { gu: 'સંપન્ન', hi: 'पूर्ण' },
  'done today': { gu: 'આજે સંપન્ન', hi: 'आज पूर्ण' },
  'upcoming': { gu: 'આગામી', hi: 'आगामी' },
  'exam ready': { gu: 'પરીક્ષા માટે તૈયાર', hi: 'परीक्षा के लिए तैयार' },
  'at risk': { gu: 'જોખમમાં', hi: 'जोखिम में' },
  'verified': { gu: 'ચકાસાયેલ', hi: 'सत्यापित' },
  'under review': { gu: 'સમીક્ષા હેઠળ', hi: 'समीक्षाधीन' },
  'resolved': { gu: 'ઉકેલાયેલ', hi: 'हल किया गया' },
  'institute synchronized': { gu: 'સંસ્થા સાથે સિંક', hi: 'संस्थान के साथ समन्वित' },
  'institutional milestone': { gu: 'સંસ્થાકીય લક્ષ્ય', hi: 'संस्थागत मील का पत्थर' },
  'sports / leisure': { gu: 'રમતગમત / મનોરંજન', hi: 'खेलकूद / विश्राम' },
  'extra skill': { gu: 'વધારાનું કૌશલ્ય', hi: 'अतिरिक्त कौशल' },
  'self-study': { gu: 'સ્વ-અધ્યયન', hi: 'स्वाध्याय' },
  'backlog recovery': { gu: 'બેકલોગ રિકવરી', hi: 'बैकलॉग रिकवरी' },
  'high confidence': { gu: 'ઉચ્ચ આત્મવિશ્વાસ', hi: 'उच्च आत्मविश्वास' },
  'needs practice': { gu: 'પ્રેક્ટિસની જરૂર', hi: 'अभ्यास की आवश्यकता' },
};

export const GLOBAL_PHRASES: Record<string, { gu: string; hi: string }> = {
  // Navigation & Brand
  'VidyaSarthi': { gu: 'વિદ્યાસારથી', hi: 'विद्यासारथी' },
  'Student Portal': { gu: 'વિદ્યાર્થી પોર્ટલ', hi: 'विद्यार्थी पोर्टल' },
  'Institute Portal': { gu: 'સંસ્થા પોર્ટલ', hi: 'संस्थान पोर्टल' },
  'Academician Portal': { gu: 'શિક્ષાવિદ પોર્ટલ', hi: 'शिक्षाविद पोर्टल' },
  'Log in': { gu: 'લૉગ ઇન', hi: 'लॉग इन' },
  'Log out': { gu: 'લૉગ આઉટ', hi: 'लॉग आउट' },
  'Sign in': { gu: 'લૉગ ઇન', hi: 'लॉग इन' },
  'Sign out': { gu: 'લૉગ આઉટ', hi: 'लॉग आउट' },
  'Register': { gu: 'નોંધણી કરો', hi: 'पंजीकरण करें' },
  'My Portal': { gu: 'મારું પોર્ટલ', hi: 'मेरा पोर्टल' },
  'Notifications': { gu: 'સૂચનાઓ', hi: 'सूचनाएं' },
  'User Profile': { gu: 'વપરાશકર્તા પ્રોફાઇલ', hi: 'उपयोगकर्ता प्रोफाइल' },
  'No new notifications right now.': { gu: 'હાલમાં કોઈ નવી સૂચનાઓ નથી.', hi: 'अभी कोई नई सूचनाएं नहीं हैं।' },
  'Syncing…': { gu: 'સિંક થઈ રહ્યું છે…', hi: 'सिंक हो रहा है…' },

  // Portal Tabs
  'Dashboard Overview': { gu: 'ડેશબોર્ડ ઓવરવ્યૂ', hi: 'डैशबोर्ड अवलोकन' },
  'Overview': { gu: 'ઓવરવ્યૂ', hi: 'अवलोकन' },
  'Dual-Track Roadmaps': { gu: 'ડ્યુઅલ-ટ્રેક રોડમેપ્સ', hi: 'दोहरे अध्ययन पथ' },
  'Syllabus & Fit Score': { gu: 'અભ્યાસક્રમ અને ફિટ સ્કોર', hi: 'पाठ्यक्रम और फिट स्कोर' },
  'AI Schedule': { gu: 'AI સમયપત્રક', hi: 'AI समय सारणी' },
  'Targeted Practice': { gu: 'લક્ષિત પ્રેક્ટિસ', hi: 'लक्षित अभ्यास' },
  'Multilingual & Visual': { gu: 'બહુભાષી અને પ્રાયોગિક', hi: 'बहुभाषी और व्यावहारिक' },
  'Faculty Mentoring': { gu: 'ફેકલ્ટી માર્ગદર્શન', hi: 'संकाय परामर्श' },
  'Research Papers': { gu: 'સંશોધન પેપર્સ', hi: 'शोध पत्र' },
  'Opportunities': { gu: 'તકો અને ઉદ્યોગ', hi: 'अवसर और उद्योग' },
  'Academic Profile': { gu: 'શૈક્ષણિક પ્રોફાઇલ', hi: 'शैक्षणिक प्रोफाइल' },
  'Student Monitoring': { gu: 'વિદ્યાર્થી દેખરેખ', hi: 'विद्यार्थी निगरानी' },
  'Marks Management': { gu: 'ગુણ વ્યવસ્થાપન', hi: 'अंक प्रबंधन' },
  'Academic Analytics': { gu: 'શૈક્ષણિક એનાલિટિક્સ', hi: 'शैक्षणिक विश्लेषण' },
  'Verifications': { gu: 'ચકાસણી', hi: 'सत्यापन' },
  'Publish Research': { gu: 'સંશોધન પ્રકાશિત કરો', hi: 'शोध पत्र प्रकाशित करें' },
  'My Research Papers': { gu: 'મારા સંશોધન પેપર્સ', hi: 'मेरे शोध पत्र' },
  'Student Discussions': { gu: 'વિદ્યાર્થી ચર્ચાઓ', hi: 'विद्यार्थी चर्चाएं' },
  'Knowledge Gaps': { gu: 'જ્ઞાનની ખામીઓ', hi: 'ज्ञान का अंतर' },
  'Backlogs': { gu: 'બેકલોગ્સ', hi: 'बैकलॉग' },

  // Timetable & Flexible Schedule
  'Weekly Master Timetable (Tabular Matrix)': { gu: 'સાપ્તાહિક મુખ્ય સમયપત્રક (કોષ્ટક મેટ્રિક્સ)', hi: 'साप्ताहिक मुख्य समय सारणी (तालिका मैट्रिक्स)' },
  'Weekly Master Matrix (Tabular Form)': { gu: 'સાપ્તાહિક મુખ્ય મેટ્રિક્સ (કોષ્ટક સ્વરૂપ)', hi: 'साप्ताहिक मुख्य मैट्रिक्स (तालिका रूप)' },
  'Daily Interactive Slots': { gu: 'દૈનિક ઇન્ટરેક્ટિવ સ્લોટ્સ', hi: 'दैनिक इंटरैक्टिव स्लॉट' },
  'Time Slot': { gu: 'સમય સ્લોટ', hi: 'समय स्लॉट' },
  'Synced with Institute & Personal Routine': { gu: 'સંસ્થા અને વ્યક્તિગત દિનચર્યા સાથે સિંક', hi: 'संस्थान और व्यक्तिगत दिनचर्या के साथ समन्वित' },
  'Full 7-day responsive grid. Completed slots on today\'s schedule turn': { gu: 'સંપૂર્ણ ૭-દિવસીય ગ્રીડ. આજના સમયપત્રકના પૂર્ણ થયેલ સ્લોટ્સ દર્શાવાય છે', hi: 'पूर्ण 7-दिवसीय ग्रिड। आज की समय सारणी के पूर्ण स्लॉट दिखाई देते हैं' },
  'Passed slots turn green with ✓': { gu: 'વીતી ગયેલા સ્લોટ લીલા રંગમાં ✓ સાથે દર્શાવાય છે', hi: 'बीते हुए स्लॉट हरे रंग में ✓ के साथ दिखाई देते हैं' },
  'green with ✓': { gu: 'લીલા રંગમાં ✓ સાથે', hi: 'हरे रंग में ✓ के साथ' },
  'Institute Class': { gu: '🏛️ સંસ્થા ક્લાસ', hi: '🏛️ संस्थान कक्षा' },
  'Extra Skill Track 2': { gu: '🚀 વધારાનું કૌશલ્ય ટ્રેક ૨', hi: '🚀 अतिरिक्त कौशल ट्रैक २' },
  'Sports / Leisure': { gu: '🏏 રમતગમત / મનોરંજન', hi: '🏏 खेलकूद / विश्राम' },
  'Backlog Recovery': { gu: '🔄 બેકલોગ રિકવરી', hi: '🔄 बैकलॉग रिकवरी' },
  'Done Today': { gu: '✓ આજે સંપન્ન', hi: '✓ आज पूर्ण' },
  'Done': { gu: '✓ સંપન્ન', hi: '✓ पूर्ण' },
  'Active Now': { gu: '⏳ હાલ સક્રિય', hi: '⏳ अभी सक्रिय' },
  'Today': { gu: 'આજે', hi: 'आज' },
  'Morning Warmup / Revision': { gu: 'સવારનું પુનરાવર્તન', hi: 'सुबह का पुनरीक्षण' },
  'College Lecture Slot 1': { gu: 'કોલેજ લેક્ચર સ્લોટ ૧', hi: 'कॉलेज व्याख्यान स्लॉट 1' },
  'College Lecture Slot 2': { gu: 'કોલેજ લેક્ચર સ્લોટ ૨', hi: 'कॉलेज व्याख्यान स्लॉट 2' },
  'College Lecture Slot 3': { gu: 'કોલેજ લેક્ચર સ્લોટ ૩', hi: 'कॉलेज व्याख्यान स्लॉट 3' },
  'Afternoon Lab / Practical': { gu: 'બપોરની લેબ / પ્રેક્ટિકલ', hi: 'दोपहर की लैब / प्रैक्टिकल' },
  'Sports & Extracurricular Fitness': { gu: 'રમતગમત અને ફિટનેસ', hi: 'खेलकूद और फिटनेस' },
  'Backlog Recovery & Deep Revision': { gu: 'બેકલોગ રિકવરી અને ઊંડું પુનરાવર્તન', hi: 'बैकलॉग रिकवरी और गहन पुनरीक्षण' },
  'Track 2 Extra Skill Learning': { gu: 'ટ્રેક ૨ વધારાનું કૌશલ્ય શિક્ષણ', hi: 'ट्रैक २ अतिरिक्त कौशल सीखना' },

  // Backlog Recovery Engine
  'Backlog Recovery Engine': { gu: 'બેકલોગ રિકવરી એન્જિન', hi: 'बैकलॉग रिकवरी इंजन' },
  'Deficit Topics': { gu: 'બાકી વિષયો', hi: 'लंबित विषय' },
  'hrs deficit': { gu: 'કલાક બાકી', hi: 'घंटे शेष' },
  'Scheduled alongside institute classes & sports': { gu: 'સંસ્થા ક્લાસ અને રમતગમત સાથે આયોજિત', hi: 'संस्थान कक्षाओं और खेलकूद के साथ निर्धारित' },
  'Missed a lecture or couldn\'t complete self-study? Backlog topics are automatically assigned to dedicated evening recovery slots (07:30 - 08:30 PM) so you catch up without academic burnout.': { gu: 'લેક્ચર ચૂકી ગયા અથવા અભ્યાસ અધૂરો રહ્યો? બેકલોગ વિષયો આપમેળે સાંજની રિકવરી સ્લોટમાં (સાંજે ૭:૩૦ - ૮:૩૦) ફાળવવામાં આવે છે.', hi: 'व्याख्यान छूट गया या स्वाध्याय अधूरा रहा? बैकलॉग विषय स्वचालित रूप से शाम के रिकवरी स्लॉट (07:30 - 08:30 PM) में निर्धारित किए जाते हैं।' },
  'Report Backlog Topic': { gu: 'બેકલોગ વિષય નોંધો', hi: 'बैकलॉग विषय दर्ज करें' },
  '+ Report Backlog Topic': { gu: '🔄 + બેકલોગ વિષય નોંધો', hi: '🔄 + बैकलॉग विषय दर्ज करें' },
  '+ Add Backlog Topic': { gu: '+ બેકલોગ વિષય ઉમેરો', hi: '+ बैकलॉग विषय जोड़ें' },
  'Log Track 2 Skill Time': { gu: '⏱️ ટ્રેક ૨ કૌશલ્ય સમય નોંધો', hi: '⏱️ ट्रैक २ कौशल समय दर्ज करें' },
  'Add Routine Slot': { gu: '+ નવો સ્લોટ ઉમેરો', hi: '+ नया स्लॉट जोड़ें' },
  '+ Add Routine Slot': { gu: '+ નવો સ્લોટ ઉમેરો', hi: '+ नया स्लॉट जोड़ें' },
  'AI Auto-Balance Routine': { gu: '⚡ AI સ્વચાલિત સંતુલન', hi: '⚡ AI स्वचालित संतुलन' },
  '+ Add Slot': { gu: '+ સ્લોટ ઉમેરો', hi: '+ स्लॉट जोड़ें' },
  'Mark Backlog Cleared': { gu: 'બેકલોગ પૂર્ણ જાહેર કરો', hi: 'बैकलॉग पूर्ण घोषित करें' },
  'Recovery Slot:': { gu: '🔄 રિકવરી સ્લોટ:', hi: '🔄 रिकवरी स्लॉट:' },
  'Next Daily Slot': { gu: 'આગામી દૈનિક સ્લોટ', hi: 'अगला दैनिक स्लॉट' },
  '✓ Cleared': { gu: '✓ સંપન્ન', hi: '✓ पूर्ण' },
  'AI-Assisted Flexible Schedule & Backlog Recovery': { gu: 'AI-સંચાલિત લવચીક સમયપત્રક અને બેકલોગ રિકવરી', hi: 'AI-सहायता प्राप्त लचीली समय सारणी और बैकलॉग रिकवरी' },
  'Integrate institute classes with dedicated Backlog Recovery slots, sports/hobbies, and track 2 skills. Time-passed sessions automatically turn green with completion ticks.': { gu: 'સંસ્થા ક્લાસ, બેકલોગ રિકવરી સ્લોટ્સ, રમતગમત અને કૌશલ્યોનું સંકલન. સમય વીતતા સત્રો આપમેળે લીલા રંગમાં ✓ સાથે દર્શાવાય છે.', hi: 'संस्थान कक्षाओं, बैकलॉग रिकवरी स्लॉट, खेलकूद और कौशलों का समन्वय। समय बीतने पर सत्र स्वचालित रूप से हरे रंग में ✓ के साथ दिखाई देते हैं।' },
  'Institute Official Schedule': { gu: 'સંસ્થા સત્તાવાર સમયપત્રક', hi: 'संस्थान आधिकारिक समय सारणी' },
  'Synced directly from faculty': { gu: 'ફેકલ્ટી દ્વારા સીધું અપડેટ થયેલ', hi: 'संकाय द्वारा सीधे अपडेट' },
  'Personal Learning & Recovery Slots': { gu: 'વ્યક્તિગત અભ્યાસ અને રિકવરી સ્લોટ્સ', hi: 'व्यक्तिगत अध्ययन और रिकवरी स्लॉट' },
  'Includes Backlog Recovery & Self-Study Check-ins': { gu: 'બેકલોગ રિકવરી અને સ્વ-અધ્યયન ચેક-ઇન સામેલ છે', hi: 'बैकलॉग रिकवरी और स्वाध्याय चेक-इन शामिल है' }  ,
  'Upcoming Scheduled Examinations & Practical Milestones': { gu: 'આગામી નિર્ધારિત પરીક્ષાઓ અને પ્રેક્ટિકલ લક્ષ્યો', hi: 'आगामी निर्धारित परीक्षाएं और व्यावहारिक मील के पत्थर' },
  'Institutional Milestone': { gu: 'સંસ્થાકીય લક્ષ્ય', hi: 'संस्थागत मील का पत्थर' },
  'Exam': { gu: 'પરીક્ષા', hi: 'परीक्षा' },

  // Post-Session Check-in Prompts
  'Session Ended: How much work was actually completed?': { gu: 'સત્ર સમાપ્ત: ખરેખર કેટલું કામ પૂર્ણ થયું?', hi: 'सत्र समाप्त: वास्तव में कितना कार्य पूर्ण हुआ?' },
  'Check-in your progress. Incomplete topics will automatically shift into tomorrow\'s Backlog Recovery slot!': { gu: 'તમારી પ્રગતિ નોંધો. અધૂરા વિષયો આપમેળે આવતીકાલના બેકલોગ રિકવરી સ્લોટમાં સ્થાનાંતરિત થશે!', hi: 'अपनी प्रगति दर्ज करें। अधूरे विषय स्वतः कल के बैकलॉग रिकवरी स्लॉट में स्थानांतरित हो जाएंगे!' },
  'Check-in Work Done': { gu: '📝 પૂર્ણ થયેલ કાર્ય નોંધો', hi: '📝 पूर्ण कार्य दर्ज करें' },
  'Logged:': { gu: 'નોંધાયેલ:', hi: 'दर्ज किया गया:' },
  'finished': { gu: 'સંપન્ન', hi: 'पूर्ण' },
  'Remaining': { gu: 'બાકી', hi: 'शेष' },
  'shifted to Backlogs': { gu: 'બેકલોગમાં ખસેડવામાં આવ્યું', hi: 'बैकलॉग में स्थानांतरित' },
  '100% Fully Completed': { gu: '૧૦૦% સંપૂર્ણ પૂર્ણ', hi: '100% पूरी तरह से पूर्ण' },

  // Meters and Gauges
  'Exam Syllabus Target Meter': { gu: 'પરીક્ષા અભ્યાસક્રમ લક્ષ્ય મીટર', hi: 'परीक्षा पाठ्यक्रम लक्ष्य मीटर' },
  'Skill Readiness & Growth Meter': { gu: 'કૌશલ્ય સજ્જતા અને વૃદ્ધિ મીટર', hi: 'कौशल तत्परता और विकास मीटर' },
  'Educational Potential Index': { gu: 'શૈક્ષણિક ક્ષમતા સૂચકાંક', hi: 'शैक्षणिक क्षमता सूचकांक' },
  'Syllabus Completed': { gu: 'અભ્યાસક્રમ પૂર્ણ', hi: 'पाठ्यक्रम पूर्ण' },
  'Daily Progress Rate': { gu: 'દૈનિક પ્રગતિ દર', hi: 'दैनिक प्रगति दर' },
  'Overall Fit Score': { gu: 'સમગ્ર ફિટ સ્કોર', hi: 'समग्र फिट स्कोर' },
  'Overall Fit Score (Exam Readiness)': { gu: 'સમગ્ર ફિટ સ્કોર (પરીક્ષા સજ્જતા)', hi: 'समग्र फिट स्कोर (परीक्षा तत्परता)' },
  'Exam Readiness': { gu: 'પરીક્ષા સજ્જતા', hi: 'परीक्षा तत्परता' },
  'Fit Score': { gu: 'ફિટ સ્કોર', hi: 'फिट स्कोर' },
  'Distance Traveled': { gu: 'કાપેલું અંતર', hi: 'तय की गई दूरी' },
  'Exam Threshold Pacing': { gu: 'પરીક્ષા લક્ષ્ય ગતિ', hi: 'परीक्षा लक्ष्य गति' },
  'Starting Baseline': { gu: 'પ્રારંભિક આધાર', hi: 'प्रारंभिक आधार' },
  'Current Competency': { gu: 'વર્તમાન ક્ષમતા', hi: 'वर्तमान दक्षता' },
  'Total Growth': { gu: 'કુલ વૃદ્ધિ', hi: 'कुल वृद्धि' },
  'Intake Baseline': { gu: 'પ્રારંભિક સ્તર', hi: 'प्रवेश आधार' },
  'Foundations': { gu: 'પાયાના ખ્યાલો', hi: 'बुनियादी अवधारणाएं' },
  'Applied Mastery': { gu: 'પ્રાયોગિક નિપુણતા', hi: 'अनुप्रयुक्त प्रवीणता' },
  'Top Tier Scholar': { gu: 'શ્રેષ્ઠ સ્કોલર', hi: 'शीर्ष विद्वान' },
  'Consistency & Effort': { gu: 'સુસંગતતા અને પ્રયાસ', hi: 'निरंतरता और प्रयास' },
  'Practice Mastery': { gu: 'પ્રેક્ટિસ નિપુણતા', hi: 'अभ्यास प्रवीणता' },
  'Growth Velocity': { gu: 'વિકાસની ગતિ', hi: 'विकास गति' },
  'Skill Learning': { gu: 'કૌશલ્ય અધ્યયન', hi: 'कौशल सीखना' },
  'Skill Competency': { gu: 'કૌશલ્ય ક્ષમતા', hi: 'कौशल प्रवीणता' },
  'Active Milestone Tier:': { gu: 'સક્રિય તબક્કો:', hi: 'सक्रिय चरण:' },
  'Daily logs & schedule adherence': { gu: 'દૈનિક લોગ અને સમયપત્રક પાલન', hi: 'दैनिक लॉग और समय सारणी का पालन' },
  'Quiz accuracy & concept retention': { gu: 'ક્વિઝ સચોટતા અને વિષય જ્ઞાન', hi: 'क्विज़ सटीकता और अवधारणा प्रतिधारण' },
  'Distance traveled from intake': { gu: 'પ્રારંભિક સ્તરથી કાપેલું અંતર', hi: 'प्रवेश स्तर से तय की गई दूरी' },
  'Extra technical tracks logged': { gu: 'વધારાના ટેકનિકલ ટ્રેક્સ નોંધાયેલ', hi: 'अतिरिक्त तकनीकी ट्रैक दर्ज' },
  'Intake Pending': { gu: 'પ્રવેશ બાકી', hi: 'प्रवेश लंबित' },
  'Formulaic index evaluating daily consistency streak, practice mastery, baseline delta, and extracurricular skill hours.': { gu: 'દૈનિક સુસંગતતા, પ્રેક્ટિસ નિપુણતા અને કૌશલ્ય કલાકોનું મૂલ્યાંકન કરતો સૂચકાંક.', hi: 'दैनिक निरंतरता, अभ्यास प्रवीणता और कौशल घंटों का मूल्यांकन करने वाला सूचकांक।' },

  // Buttons, Actions & Form terms
  'Complete Intake': { gu: 'પ્રવેશ વિગતો ભરો', hi: 'प्रवेश विवरण भरें' },
  'Log Today\'s Topics': { gu: 'આજના વિષયો નોંધો', hi: 'आज के विषय दर्ज करें' },
  'Today\'s Practice Test': { gu: 'આજની પ્રેક્ટિસ ટેસ્ટ', hi: 'आज की अभ्यास परीक्षा' },
  'Take Today\'s Practice Test': { gu: 'આજની પ્રેક્ટિસ ટેસ્ટ આપો', hi: 'आज की अभ्यास परीक्षा दें' },
  'Generate AI Timetable': { gu: 'AI સમયપત્રક બનાવો', hi: 'AI समय सारणी बनाएं' },
  'Report Knowledge Gap': { gu: 'જ્ઞાનની ખામી નોંધો', hi: 'ज्ञान अंतर की रिपोर्ट करें' },
  'Start Diagnostic Test': { gu: 'મૂલ્યાંકન ટેસ્ટ શરૂ કરો', hi: 'मूल्यांकन परीक्षा शुरू करें' },
  'Save Changes': { gu: 'ફેરફારો સાચવો', hi: 'परिवर्तन सहेजें' },
  'Save': { gu: 'સાચવો', hi: 'सहेजें' },
  'Submit': { gu: 'સબમિટ કરો', hi: 'जमा करें' },
  'Cancel': { gu: 'રદ કરો', hi: 'रद्द करें' },
  'Close': { gu: 'બંધ કરો', hi: 'बंद करें' },
  'Delete': { gu: 'કાઢી નાખો', hi: 'हटाएं' },
  'Edit': { gu: 'સંપાદિત કરો', hi: 'संपादित करें' },
  'Search': { gu: 'શોધો', hi: 'खोजें' },
  'Filter': { gu: 'ફિલ્ટર', hi: 'फ़िल्टर' },
  'Filter by Subject': { gu: 'વિષય અનુસાર ફિલ્ટર કરો', hi: 'विषय अनुसार फ़िल्टर करें' },
  'All Subjects': { gu: 'બધા વિષયો', hi: 'सभी विषय' },
  'All': { gu: 'બધા', hi: 'सभी' },
  'Verified': { gu: 'ચકાસાયેલ', hi: 'सत्यापित' },
  'No data found.': { gu: 'કોઈ માહિતી મળી નથી.', hi: 'कोई डेटा नहीं मिला।' },
  'points to the required level': { gu: 'જરૂરી સ્તર સુધીના પોઈન્ટ્સ', hi: 'आवश्यक स्तर तक के अंक' },
  'needs': { gu: 'જરૂર છે', hi: 'आवश्यकता है' },
  'Subject': { gu: 'વિષય', hi: 'विषय' },
  'Subject Name': { gu: 'વિષયનું નામ', hi: 'विषय का नाम' },
  'Topic': { gu: 'વિષય શીર્ષક', hi: 'शीर्षक' },
  'Topic Title': { gu: 'વિષયનું શીર્ષક', hi: 'विषय का शीर्षक' },
  'Estimated Hours': { gu: 'અંદાજિત કલાકો', hi: 'अनुमानित घंटे' },
  'Estimated Hours Needed': { gu: 'જરૂરી અંદાજિત કલાકો', hi: 'आवश्यक अनुमानित घंटे' },
  'Priority': { gu: 'પ્રાધાન્યતા', hi: 'प्राथमिकता' },
  'Target Recovery Day': { gu: 'લક્ષ્ય રિકવરી દિવસ', hi: 'लक्षित रिकवरी दिन' },
  'Notes': { gu: 'નોંધ', hi: 'टिप्पणी' },
  'Notes / Insights': { gu: 'નોંધ / સમજ', hi: 'टिप्पणी / समझ' },
  'Notes / Why It\'s Behind': { gu: 'નોંધ / કેમ પાછળ છે', hi: 'टिप्पणी / क्यों पीछे है' },
  'Study Duration (Minutes)': { gu: 'અભ્યાસ સમયગાળો (મિનિટ)', hi: 'अध्ययन अवधि (मिनट)' },
  'Practice Questions Solved': { gu: 'ઉકેલાયેલ પ્રેક્ટિસ પ્રશ્નો', hi: 'हल किए गए अभ्यास प्रश्न' },
  'Topics Completed Today (comma-separated)': { gu: 'આજે પૂર્ણ થયેલ વિષયો (અલ્પવિરામ દ્વારા અલગ કરો)', hi: 'आज पूर्ण किए गए विषय (अल्पविराम द्वारा अलग)' },
  'Topics Revised Today (optional)': { gu: 'આજે પુનરાવર્તિત વિષયો (વૈકલ્પિક)', hi: 'आज दोहराए गए विषय (वैकल्पिक)' },
  'Save Syllabus Update': { gu: 'અભ્યાસક્રમ અપડેટ સાચવો', hi: 'पाठ्यक्रम अपडेट सहेजें' },
  'Saving...': { gu: 'સાચવી રહ્યું છે...', hi: 'सहेजा जा रहा है...' },
  'Reserve Backlog Recovery Slot': { gu: 'બેકલોગ રિકવરી સ્લોટ અનામત રાખો', hi: 'बैकलॉग रिकवरी स्लॉट आरक्षित करें' },
  'Report & Schedule Backlog Topic': { gu: 'બેકલોગ વિષય નોંધો અને આયોજિત કરો', hi: 'बैकलॉग विषय दर्ज करें और निर्धारित करें' },

  // Practice & Quiz View
  'Weak-Subject Remediation & Practice Tests': { gu: 'નબળા વિષયોનું નિવારણ અને પ્રેક્ટિસ ટેસ્ટ', hi: 'कमजोर विषयों का निवारण और अभ्यास परीक्षण' },
  'Daily diagnostic practice tests automatically targeted at topics with low exam scores to lift academic readiness.': { gu: 'પરીક્ષા સજ્જતા વધારવા માટે ઓછા ગુણવાળા વિષયો પર લક્ષિત દૈનિક પ્રેક્ટિસ ટેસ્ટ.', hi: 'परीक्षा तत्परता बढ़ाने के लिए कम अंक वाले विषयों पर लक्षित दैनिक अभ्यास परीक्षण।' },
  'Active Weak-Subject Alerts': { gu: 'સક્રિય નબળા વિષય ચેતવણીઓ', hi: 'सक्रिय कमजोर विषय अलर्ट' },
  'Start 10-Question Targeted Quiz': { gu: '૧૦ પ્રશ્નોની લક્ષિત ક્વિઝ શરૂ કરો', hi: '10 प्रश्नों की लक्षित क्विज़ शुरू करें' },
  'Practice vs. Real Exam Performance Correlation': { gu: 'પ્રેક્ટિસ વિ. વાસ્તવિક પરીક્ષા પ્રદર્શન સહસંબંધ', hi: 'अभ्यास बनाम वास्तविक परीक्षा प्रदर्शन सहसंबंध' },
  'Verifies if daily practice tests are successfully translating into higher college exam marks.': { gu: 'દૈનિક પ્રેક્ટિસ ટેસ્ટ વાસ્તવિક પરીક્ષાના ગુણમાં વધારો કરે છે કે નહીં તેની ચકાસણી.', hi: 'सत्यापित करता है कि क्या दैनिक अभ्यास परीक्षण कॉलेज परीक्षा अंकों में वृद्धि कर रहे हैं।' },
  'Practice Average': { gu: 'પ્રેક્ટિસ સરેરાશ', hi: 'अभ्यास औसत' },
  'Official Exam Marks': { gu: 'સત્તાવાર પરીક્ષા ગુણ', hi: 'आधिकारिक परीक्षा अंक' },
  'Variance / Gain': { gu: 'તફાવત / સુધારો', hi: 'अंतर / सुधार' },
  'Readiness Verdict': { gu: 'સજ્જતા નિર્ણય', hi: 'तत्परता निर्णय' },
  'Quick Action': { gu: 'ઝડપી પગલું', hi: 'त्वरित कार्रवाई' },
  'Improvement': { gu: 'સુધારો', hi: 'सुधार' },
  'Deficit': { gu: 'ખામી', hi: 'कमी' },
  'Practice Topic': { gu: 'વિષય પ્રેક્ટિસ કરો', hi: 'विषय अभ्यास करें' },
  'Completed Practice Tests History': { gu: 'પૂર્ણ થયેલ પ્રેક્ટિસ ટેસ્ટનો ઇતિહાસ', hi: 'पूर्ण अभ्यास परीक्षणों का इतिहास' },
  'No practice tests logged yet.': { gu: 'હજુ સુધી કોઈ પ્રેક્ટિસ ટેસ્ટ નોંધાયેલ નથી.', hi: 'अभी तक कोई अभ्यास परीक्षण दर्ज नहीं किया गया है।' },
  'Mistakes analyzed:': { gu: 'ભૂલોનું વિશ્લેષણ:', hi: 'गलतियों का विश्लेषण:' },
  'Score:': { gu: 'સ્કોર:', hi: 'स्कोर:' },
  'Accuracy:': { gu: 'સચોટતા:', hi: 'सटीकता:' },
  'Your Practice Score': { gu: 'તમારો પ્રેક્ટિસ સ્કોર', hi: 'आपका अभ्यास स्कोर' },
  'Submit Practice Test': { gu: 'પ્રેક્ટિસ ટેસ્ટ સબમિટ કરો', hi: 'अभ्यास परीक्षा जमा करें' },
  'Next Question →': { gu: 'આગળનો પ્રશ્ન →', hi: 'अगला प्रश्न →' },
  '← Previous': { gu: '← પાછળ', hi: '← पिछला' },

  // Syllabus View
  'Curriculum Syllabus & Dynamic Fit Score': { gu: 'શૈક્ષણિક અભ્યાસક્રમ અને ગતિશીલ ફિટ સ્કોર', hi: 'शैक्षणिक पाठ्यक्रम और गतिशील फिट स्कोर' },
  'Core Academic Curriculum': { gu: 'મુખ્ય શૈક્ષણિક અભ્યાસક્રમ', hi: 'मुख्य शैक्षणिक पाठ्यक्रम' },
  'Additional Skill Pathways': { gu: 'વધારાના કૌશલ્ય પથ', hi: 'अतिरिक्त कौशल पथ' },
  'Units & Topics Checklist': { gu: 'એકમો અને વિષયોની યાદી', hi: 'इकाइयां और विषय चेकलिस्ट' },

  // Mentoring & Research
  'Faculty Mentoring & Query Hub': { gu: 'ફેકલ્ટી માર્ગદર્શન અને પ્રશ્નોત્તરી', hi: 'संकाय परामर्श और शंका निवारण' },
  'Ask Academic Doubt': { gu: 'શૈક્ષણિક પ્રશ્ન પૂછો', hi: 'शैक्षणिक प्रश्न पूछें' },
  'Academic Research Papers & Collaborations': { gu: 'શૈક્ષણિક સંશોધન પેપર્સ અને સહયોગ', hi: 'शैक्षणिक शोध पत्र और सहयोग' },
  'Discuss Paper with Author': { gu: 'લેખક સાથે પેપર પર ચર્ચા કરો', hi: 'लेखक के साथ शोध पत्र पर चर्चा करें' },
  'Read Full Paper': { gu: 'સંપૂર્ણ પેપર વાંચો', hi: 'पूरा शोध पत्र पढ़ें' },

  // Institute Portal
  'Institute Academic Dashboard': { gu: 'સંસ્થા શૈક્ષણિક ડેશબોર્ડ', hi: 'संस्थान शैक्षणिक डैशबोर्ड' },
  'Real-time academic monitoring, syllabus progress, marks management, and student mentoring.': { gu: 'વાસ્તવિક સમય શૈક્ષણિક દેખરેખ, અભ્યાસક્રમ પ્રગતિ, ગુણ વ્યવસ્થાપન અને વિદ્યાર્થી માર્ગદર્શન.', hi: 'वास्तविक समय शैक्षणिक निगरानी, पाठ्यक्रम प्रगति, अंक प्रबंधन और छात्र परामर्श।' },
  '+ Publish Schedule': { gu: '+ સમયપત્રક પ્રકાશિત કરો', hi: '+ समय सारणी प्रकाशित करें' },
  '+ Enter Marks': { gu: '+ ગુણ દાખલ કરો', hi: '+ अंक दर्ज करें' },
  'Enrolled Students': { gu: 'નોંધાયેલા વિદ્યાર્થીઓ', hi: 'नामांकित छात्र' },
  'Avg Academic Score': { gu: 'સરેરાશ શૈક્ષણિક સ્કોર', hi: 'औसत शैक्षणिक स्कोर' },
  'Avg Syllabus Progress': { gu: 'સરેરાશ અભ્યાસક્રમ પ્રગતિ', hi: 'औसत पाठ्यक्रम प्रगति' },
  'Avg Exam Readiness': { gu: 'સરેરાશ પરીક્ષા સજ્જતા', hi: 'औसत परीक्षा तत्परता' },
  'Avg Potential Index': { gu: 'સરેરાશ ક્ષમતા સૂચકાંક', hi: 'औसत क्षमता सूचकांक' },
  'Students Needing Attention': { gu: 'ધ્યાન આપવા યોગ્ય વિદ્યાર્થીઓ', hi: 'ध्यान देने योग्य छात्र' },
  'Pending Student Queries': { gu: 'બાકી વિદ્યાર્થી પ્રશ્નો', hi: 'लंबित छात्र प्रश्न' },
  'Review List →': { gu: 'યાદી જુઓ →', hi: 'सूची देखें →' },
  'Weak subject alerts active': { gu: 'નબળા વિષયની ચેતવણીઓ સક્રિય', hi: 'कमजोर विषय अलर्ट सक्रिय' },
  'Academic doubts & guidance': { gu: 'શૈક્ષણિક પ્રશ્નો અને માર્ગદર્શન', hi: 'शैक्षणिक शंकाएं और मार्गदर्शन' },
  'Cohort Growth: High': { gu: 'વિદ્યાર્થી જૂથ વૃદ્ધિ: ઉચ્ચ', hi: 'छात्र समूह विकास: उच्च' },

  // Auth Modal
  'Welcome to VidyaSarthi': { gu: 'વિદ્યાસારથીમાં આપનું સ્વાગત છે', hi: 'विद्यासारथी में आपका स्वागत है' },
  'Create your account': { gu: 'તમારું ખાતું બનાવો', hi: 'अपना खाता बनाएं' },
  'Log in to your account': { gu: 'તમારા ખાતામાં લૉગ ઇન કરો', hi: 'अपने खाते में लॉग इन करें' },
  'Email Address': { gu: 'ઈમેલ એડ્રેસ', hi: 'ईमेल पता' },
  'Password': { gu: 'પાસવર્ડ', hi: 'पासवर्ड' },
  'Full Name': { gu: 'પૂરું નામ', hi: 'पूरा नाम' },
  'Select Your Role': { gu: 'તમારી ભૂમિકા પસંદ કરો', hi: 'अपनी भूमिका चुनें' },
  'Student': { gu: 'વિદ્યાર્થી', hi: 'विद्यार्थी' },
  'Institute': { gu: 'સંસ્થા', hi: 'संस्थान' },
  'Academician': { gu: 'શિક્ષાવિદ', hi: 'शिक्षाविद' },
  'Forgot password?': { gu: 'પાસવર્ડ ભૂલી ગયા છો?', hi: 'पासवर्ड भूल गए?' },
  'Don\'t have an account?': { gu: 'ખાતું નથી?', hi: 'खाता नहीं है?' },
  'Already have an account?': { gu: 'પહેલેથી જ ખાતું છે?', hi: 'पहले से खाता है?' },
};

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Nav
    'nav.brand': 'VidyaSarthi',
    'nav.student_portal': 'Student Portal',
    'nav.institute_portal': 'Institute Portal',
    'nav.academician_portal': 'Academician Portal',
    'nav.sign_in': 'Log in',
    'nav.sign_out': 'Log out',
    'nav.register': 'Register',
    'nav.my_portal': 'My Portal',
    'nav.notifications': 'Notifications',

    // Portal Tabs
    'tab.overview': 'Dashboard Overview',
    'tab.pathways': 'Dual-Track Roadmaps',
    'tab.syllabus': 'Syllabus & Fit Score',
    'tab.schedule': 'AI Schedule',
    'tab.practice': 'Targeted Practice',
    'tab.learning': 'Multilingual & Visual',
    'tab.mentoring': 'Faculty Mentoring',
    'tab.research': 'Research Papers',
    'tab.opportunities': 'Opportunities',
    'tab.profile': 'Academic Profile',
    'tab.students': 'Student Monitoring',
    'tab.marks': 'Marks Management',
    'tab.analytics': 'Academic Analytics',
    'tab.verifications': 'Verifications',
    'tab.publish': 'Publish Research',
    'tab.papers': 'My Research Papers',
    'tab.discuss': 'Student Discussions',
    'tab.knowledge_gaps': 'Knowledge Gaps',
    'tab.backlogs': 'Backlogs',

    // Landing Page Hero
    'landing.badge_ecosystem': 'Connected Educational Ecosystem',
    'landing.badge_roles': 'Students • Institutes • Academicians',
    'landing.hero_title': 'Master your curriculum. Explore personal passions. One unified ecosystem.',
    'landing.hero_desc': 'VidyaSarthi brings formal education and flexible personal learning together. Follow your institute syllabus, track exam readiness with precision, build extra skills through adaptive pathways, and engage directly with cutting-edge academic research.',
    'landing.btn_gateway': 'Go to Dedicated Portal Gateway ↓',
    'landing.btn_register': 'Get Started (Register) →',

    // Landing Page Stats
    'landing.stat_curriculum': 'Curriculum + Extra Learning',
    'landing.stat_readiness': 'Dynamic Exam Readiness',
    'landing.stat_weak': 'Targeted Weak Subject Practice',
    'landing.stat_discussions': 'Academician Research Discussions',

    // Landing Page Three Pillars
    'landing.pillars_title': 'Three pillars. One connected educational ecosystem.',
    'landing.pillars_desc': 'Connecting student learning journeys, institutional monitoring & guidance, and academic research sharing.',
    'landing.pillar_student_title': 'Student Ecosystem',
    'landing.pillar_student_desc': 'Manage curriculum, additional learning, syllabus progress, and exams.',
    'landing.pillar_institute_title': 'Institute Ecosystem',
    'landing.pillar_institute_desc': 'Academic schedules, marks management, student monitoring, and mentoring.',
    'landing.pillar_academician_title': 'Academician Ecosystem',
    'landing.pillar_academician_desc': 'Publish research and collaborate directly with students.',

    // Landing Page Dual-Track
    'landing.diff_tag': 'The VidyaSarthi Difference',
    'landing.diff_title': 'Dual-Track Learning: Curriculum + Passion',
    'landing.diff_desc': 'Most platforms either trap students in a rigid course or ignore their official college curriculum. VidyaSarthi balances both:',
    'landing.track_a_badge': 'Track A: Academic Curriculum',
    'landing.track_a_title': 'School & College Syllabus Management',
    'landing.track_a_item1_strong': 'Syllabus Progress & Fit Score:',
    'landing.track_a_item1_text': 'Know exactly what percent of your syllabus is complete and your exam readiness.',
    'landing.track_a_item2_strong': 'Weak-Subject Detection:',
    'landing.track_a_item2_text': 'System analyzes exam marks and triggers automated daily practice tests.',
    'landing.track_a_item3_strong': 'Institute Timetable Sync:',
    'landing.track_a_item3_text': 'Classes, midterm exams, and practical schedules directly on your dashboard.',
    'landing.track_a_item4_strong': 'Institute Mentoring & Queries:',
    'landing.track_a_item4_text': 'Ask academic doubts directly to faculty with resolved tracking.',

    'landing.track_b_badge': 'Track B: Additional Learning',
    'landing.track_b_title': 'Personal Interests, Emerging Tech & Skills',
    'landing.track_b_item1_strong': 'Diverse Subjects:',
    'landing.track_b_item1_text': 'Python, AI, Robotics, Data Science, Web Dev, Finance, Design, Psychology, and more.',
    'landing.track_b_item2_strong': 'Diagnostic Knowledge Assessment:',
    'landing.track_b_item2_text': 'Discrete initial test determines your starting point (Beginner/Intermediate/Advanced).',
    'landing.track_b_item3_strong': 'Adaptive Pathways:',
    'landing.track_b_item3_text': 'Step-by-step topic nodes that dynamically advance or provide revision based on practice.',
    'landing.track_b_item4_strong': 'AI-Assisted Timetable:',
    'landing.track_b_item4_text': 'Intelligently blends institute schedules, extra learning, and personal sports/free time.',

    // Landing Page Flow & Gateway
    'landing.flow_title': 'How information moves between roles',
    'landing.flow_desc': 'Nothing lives in isolation — academic schedules, daily learning updates, diagnostic tests, and research discussions feed into one continuous growth loop.',
    'landing.gateway_tag': 'Unified Platform Access',
    'landing.gateway_title': 'Dedicated Portal Gateway',
    'landing.gateway_desc': 'Select your role below to enter your specialized workspace, tools, and analytics.',
    'landing.btn_enter_student': 'Enter Student Portal',
    'landing.btn_enter_institute': 'Enter Institute Portal',
    'landing.btn_enter_academician': 'Enter Academician Portal',
    'landing.footer_text': '© 2026 VidyaSarthi — Flexible Educational Ecosystem & Skill Intelligence Platform.',

    // Meters & Key Metrics
    'meter.exam_target': 'Exam Syllabus Target Meter',
    'meter.skill_growth': 'Skill Readiness & Growth Meter',
    'meter.potential_index': 'Educational Potential Index',
    'meter.syllabus_covered': 'Syllabus Completed',
    'meter.progress_rate': 'Daily Progress Rate',
    'meter.overall_fit': 'Overall Fit Score (Exam Readiness)',
    'meter.distance_traveled': 'Distance Traveled',
    'meter.fit_score': 'Exam Readiness (Fit Score)',
    'meter.days_left': 'days left',
    'meter.on_track': 'On Track',
    'meter.baseline': 'Starting Baseline',
    'meter.current': 'Current Competency',
    'meter.growth': 'Total Growth',

    // Actions & Buttons
    'action.complete_intake': 'Complete Intake',
    'action.daily_update': "Log Today's Topics",
    'action.today_quiz': "Today's Practice Test",
    'action.generate_timetable': 'Generate AI Timetable',
    'action.report_gap': 'Report Knowledge Gap',
    'action.start_diagnostic': 'Start Diagnostic Test',
    'action.start_practice': 'Take Daily Practice Test',
    'action.save': 'Save Changes',
    'action.submit': 'Submit',
    'action.cancel': 'Cancel',
    'action.back': 'Back',

    // Greetings & Alerts
    'greeting.welcome': 'Welcome to VidyaSarthi',
    'greeting.welcome_back': 'Welcome back',
    'greeting.action_required': 'Action Required • Initial Profile Intake',
    'greeting.dual_track_desc': 'Dual-track academic & skill dashboard. You are on track for upcoming mid-terms.',
    'greeting.intake_desc': 'Complete your initial curriculum intake below to calibrate your dual-track syllabus, AI timetable, and diagnostic tests.',
    'alert.weak_subjects': 'Weak Subjects Detected',
  },

  gu: {
    // Nav
    'nav.brand': 'વિદ્યાસારથી',
    'nav.student_portal': 'વિદ્યાર્થી પોર્ટલ',
    'nav.institute_portal': 'સંસ્થા પોર્ટલ',
    'nav.academician_portal': 'શિક્ષાવિદ પોર્ટલ',
    'nav.sign_in': 'લૉગ ઇન',
    'nav.sign_out': 'લૉગ આઉટ',
    'nav.register': 'નોંધણી કરો',
    'nav.my_portal': 'મારું પોર્ટલ',
    'nav.notifications': 'સૂચનાઓ',

    // Portal Tabs
    'tab.overview': 'ડેશબોર્ડ ઓવરવ્યૂ',
    'tab.pathways': 'ડ્યુઅલ-ટ્રેક રોડમેપ્સ',
    'tab.syllabus': 'અભ્યાસક્રમ અને ફિટ સ્કોર',
    'tab.schedule': 'AI સમયપત્રક',
    'tab.practice': 'લક્ષિત પ્રેક્ટિસ',
    'tab.learning': 'બહુભાષી અને પ્રાયોગિક શિક્ષણ',
    'tab.mentoring': 'માર્ગદર્શન અને પ્રશ્નો',
    'tab.research': 'સંશોધન પેપર્સ',
    'tab.opportunities': 'તકો અને ઉદ્યોગ',
    'tab.profile': 'શૈક્ષણિક પ્રોફાઇલ',
    'tab.students': 'વિદ્યાર્થી દેખરેખ',
    'tab.marks': 'ગુણ વ્યવસ્થાપન',
    'tab.analytics': 'શૈક્ષણિક એનાલિટિક્સ',
    'tab.verifications': 'ચકાસણી',
    'tab.publish': 'સંશોધન પ્રકાશિત કરો',
    'tab.papers': 'મારા સંશોધન પેપર્સ',
    'tab.discuss': 'વિદ્યાર્થી ચર્ચાઓ',
    'tab.knowledge_gaps': 'જ્ઞાનની ખામીઓ',
    'tab.backlogs': 'બેકલોગ્સ',

    // Landing Page Hero
    'landing.badge_ecosystem': 'સંકલિત શૈક્ષણિક ઇકોસિસ્ટમ',
    'landing.badge_roles': 'વિદ્યાર્થીઓ • સંસ્થાઓ • શિક્ષાવિદો',
    'landing.hero_title': 'તમારા અભ્યાસક્રમમાં નિપુણતા મેળવો. વ્યક્તિગત રુચિઓ વિકસાવો. એક સંકલિત પ્લેટફોર્મ.',
    'landing.hero_desc': 'વિદ્યાસારથી ઔપચારિક શિક્ષણ અને લવચીક વ્યક્તિગત અભ્યાસને એકસાથે લાવે છે. તમારી કોલેજનો અભ્યાસક્રમ અનુસરો, પરીક્ષાની તૈયારી ટ્રેક કરો, વધારાના કૌશલ્યો શીખો અને સંશોધન સાથે જોડાઓ.',
    'landing.btn_gateway': 'સમર્પિત પોર્ટલ ગેટવે પર જાઓ ↓',
    'landing.btn_register': 'શરૂ કરો (નોંધણી) →',

    // Landing Page Stats
    'landing.stat_curriculum': 'અભ્યાસક્રમ + વધારાનું શિક્ષણ',
    'landing.stat_readiness': 'ગતિશીલ પરીક્ષા સજ્જતા',
    'landing.stat_weak': 'નબળા વિષયોની લક્ષિત પ્રેક્ટિસ',
    'landing.stat_discussions': 'શિક્ષાવિદ સંશોધન ચર્ચાઓ',

    // Landing Page Three Pillars
    'landing.pillars_title': 'ત્રણ સ્તંભો. એક સંકલિત શૈક્ષણિક વ્યવસ્થા.',
    'landing.pillars_desc': 'વિદ્યાર્થી શિક્ષણ પ્રવાસ, સંસ્થાકીય માર્ગદર્શન અને સંશોધનનું જોડાણ.',
    'landing.pillar_student_title': 'વિદ્યાર્થી ઇકોસિસ્ટમ',
    'landing.pillar_student_desc': 'અભ્યાસક્રમ, કૌશલ્યો, પ્રગતિ અને પરીક્ષાઓનું સંચાલન કરો.',
    'landing.pillar_institute_title': 'સંસ્થા ઇકોસિસ્ટમ',
    'landing.pillar_institute_desc': 'સમયપત્રક, ગુણ વ્યવસ્થાપન, વિદ્યાર્થી દેખરેખ અને માર્ગદર્શન.',
    'landing.pillar_academician_title': 'શિક્ષાવિદ ઇકોસિસ્ટમ',
    'landing.pillar_academician_desc': 'સંશોધન પ્રકાશિત કરો અને વિદ્યાર્થીઓ સાથે સંવાદ કરો.',

    // Landing Page Dual-Track
    'landing.diff_tag': 'વિદ્યાસારથીની વિશેષતા',
    'landing.diff_title': 'ડ્યુઅલ-ટ્રેક લર્નિંગ: અભ્યાસક્રમ + રુચિ',
    'landing.diff_desc': 'મોટાભાગના પ્લેટફોર્મ કોલેજના અભ્યાસક્રમની અવગણના કરે છે. વિદ્યાસારથી બંને વચ્ચે સંતુલન બનાવે છે:',
    'landing.track_a_badge': 'ટ્રેક એ: શૈક્ષણિક અભ્યાસક્રમ',
    'landing.track_a_title': 'શાળા અને કોલેજ અભ્યાસક્રમ સંચાલન',
    'landing.track_a_item1_strong': 'અભ્યાસક્રમ પ્રગતિ અને ફિટ સ્કોર:',
    'landing.track_a_item1_text': 'તમારો અભ્યાસક્રમ કેટલો પૂર્ણ થયો છે અને પરીક્ષા સજ્જતા બરાબર જાણો.',
    'landing.track_a_item2_strong': 'નબળા વિષયની શોધ:',
    'landing.track_a_item2_text': 'પરીક્ષાના ગુણનું વિશ્લેષણ કરી દૈનિક પ્રેક્ટિસ ટેસ્ટ બનાવે છે.',
    'landing.track_a_item3_strong': 'સંસ્થા સમયપત્રક સિંક:',
    'landing.track_a_item3_text': 'ક્લાસ, મિડટર્મ અને પ્રેક્ટિકલ સમયપત્રક સીધા ડેશબોર્ડ પર.',
    'landing.track_a_item4_strong': 'માર્ગદર્શન અને પ્રશ્નોત્તરી:',
    'landing.track_a_item4_text': 'શિક્ષકોને સીધા પ્રશ્નો પૂછો અને શંકાઓનું નિવારણ મેળવો.',

    'landing.track_b_badge': 'ટ્રેક બી: વધારાનું શિક્ષણ',
    'landing.track_b_title': 'વ્યક્તિગત રુચિઓ અને નવા કૌશલ્યો',
    'landing.track_b_item1_strong': 'વિવિધ વિષયો:',
    'landing.track_b_item1_text': 'પાયથન, AI, રોબોટિક્સ, ડેટા સાયન્સ, વેબ ડેવલપમેન્ટ, ડિઝાઇન.',
    'landing.track_b_item2_strong': 'પ્રારંભિક જ્ઞાન મૂલ્યાંકન:',
    'landing.track_b_item2_text': 'પ્રારંભિક મૂલ્યાંકન ટેસ્ટથી તમારું સ્તર નક્કી થાય છે.',
    'landing.track_b_item3_strong': 'અનુકૂલનશીલ શિક્ષણ:',
    'landing.track_b_item3_text': 'પ્રેક્ટિસના આધારે આગળ વધતા વિષયો.',
    'landing.track_b_item4_strong': 'AI સમયપત્રક:',
    'landing.track_b_item4_text': 'કોલેજ સમયપત્રક, વધારાનો અભ્યાસ અને રમતગમતનું સંતુલન.',

    // Landing Page Flow & Gateway
    'landing.flow_title': 'માહિતીનો અવિરત પ્રવાહ',
    'landing.flow_desc': 'સમયપત્રક, દૈનિક પ્રગતિ, મૂલ્યાંકન અને સંશોધન ચર્ચાઓ એક સતત વિકાસ ચક્ર રચે છે.',
    'landing.gateway_tag': 'સંકલિત પ્લેટફોર્મ એક્સેસ',
    'landing.gateway_title': 'સમર્પિત પોર્ટલ ગેટવે',
    'landing.gateway_desc': 'તમારા વિશેષ સાધનો અને વિશ્લેષણ જોવા માટે તમારી ભૂમિકા પસંદ કરો.',
    'landing.btn_enter_student': 'વિદ્યાર્થી પોર્ટલમાં પ્રવેશ કરો',
    'landing.btn_enter_institute': 'સંસ્થા પોર્ટલમાં પ્રવેશ કરો',
    'landing.btn_enter_academician': 'શિક્ષાવિદ પોર્ટલમાં પ્રવેશ કરો',
    'landing.footer_text': '© 2026 વિદ્યાસારથી — લવચીક શૈક્ષણિક ઇકોસિસ્ટમ અને કૌશલ્ય પ્લેટફોર્મ.',

    // Meters & Key Metrics
    'meter.exam_target': 'પરીક્ષા અભ્યાસક્રમ લક્ષ્ય મીટર',
    'meter.skill_growth': 'કૌશલ્ય સજ્જતા અને વૃદ્ધિ મીટર',
    'meter.potential_index': 'શૈક્ષણિક ક્ષમતા સૂચકાંક',
    'meter.syllabus_covered': 'અભ્યાસક્રમ પૂર્ણ',
    'meter.progress_rate': 'દૈનિક પ્રગતિ દર',
    'meter.overall_fit': 'સમગ્ર ફિટ સ્કોર (પરીક્ષા સજ્જતા)',
    'meter.distance_traveled': 'કાપેલું અંતર',
    'meter.fit_score': 'પરીક્ષા સજ્જતા (ફિટ સ્કોર)',
    'meter.days_left': 'દિવસ બાકી',
    'meter.on_track': 'યોગ્ય ગતિ પર',
    'meter.baseline': 'પ્રારંભિક આધાર',
    'meter.current': 'વર્તમાન ક્ષમતા',
    'meter.growth': 'કુલ વૃદ્ધિ',

    // Actions & Buttons
    'action.complete_intake': 'પ્રવેશ વિગતો ભરો',
    'action.daily_update': 'આજના વિષયો નોંધો',
    'action.today_quiz': 'આજની પ્રેક્ટિસ ટેસ્ટ',
    'action.generate_timetable': 'AI સમયપત્રક બનાવો',
    'action.report_gap': 'જ્ઞાનની ખામી નોંધો',
    'action.start_diagnostic': 'મૂલ્યાંકન ટેસ્ટ શરૂ કરો',
    'action.start_practice': 'દૈનિક પ્રેક્ટિસ ટેસ્ટ આપો',
    'action.save': 'ફેરફારો સાચવો',
    'action.submit': 'સબમિટ કરો',
    'action.cancel': 'રદ કરો',
    'action.back': 'પાછા જાઓ',

    // Greetings & Alerts
    'greeting.welcome': 'વિદ્યાસારથીમાં આપનું સ્વાગત છે',
    'greeting.welcome_back': 'પાછા આવવા બદલ સ્વાગત છે',
    'greeting.action_required': 'પગલું જરૂરી • પ્રારંભિક પ્રોફાઇલ વિગતો',
    'greeting.dual_track_desc': 'ડ્યુઅલ-ટ્રેક શૈક્ષણિક અને કૌશલ્ય ડેશબોર્ડ. આગામી પરીક્ષાઓ માટે તમે યોગ્ય માર્ગ પર છો.',
    'greeting.intake_desc': 'ડ્યુઅલ અભ્યાસક્રમ, AI સમયપત્રક અને ટેસ્ટ તૈયાર કરવા નીચે વિગતો ભરો.',
    'alert.weak_subjects': 'નબળા વિષયો ચિહ્નિત થયા',
  },

  hi: {
    // Nav
    'nav.brand': 'विद्यासारथी',
    'nav.student_portal': 'विद्यार्थी पोर्टल',
    'nav.institute_portal': 'संस्थान पोर्टल',
    'nav.academician_portal': 'शिक्षाविद पोर्टल',
    'nav.sign_in': 'लॉग इन करें',
    'nav.sign_out': 'लॉग आउट',
    'nav.register': 'पंजीकरण करें',
    'nav.my_portal': 'मेरा पोर्टल',
    'nav.notifications': 'सूचनाएं',

    // Portal Tabs
    'tab.overview': 'डैशबोर्ड अवलोकन',
    'tab.pathways': 'दोहरे अध्ययन पथ',
    'tab.syllabus': 'पाठ्यक्रम और फिट स्कोर',
    'tab.schedule': 'AI समय सारणी',
    'tab.practice': 'लक्षित अभ्यास',
    'tab.learning': 'बहुभाषी और व्यावहारिक शिक्षण',
    'tab.mentoring': 'संकाय परामर्श व प्रश्न',
    'tab.research': 'शिक्षाविद शोध पत्र',
    'tab.opportunities': 'अवसर और उद्योग',
    'tab.profile': 'शैक्षणिक प्रोफाइल',
    'tab.students': 'विद्यार्थी निगरानी',
    'tab.marks': 'अंक प्रबंधन',
    'tab.analytics': 'शैक्षणिक विश्लेषण',
    'tab.verifications': 'सत्यापन',
    'tab.publish': 'शोध पत्र प्रकाशित करें',
    'tab.papers': 'मेरे शोध पत्र',
    'tab.discuss': 'विद्यार्थी चर्चाएं',
    'tab.knowledge_gaps': 'ज्ञान का अंतर',
    'tab.backlogs': 'बैकलॉग',

    // Landing Page Hero
    'landing.badge_ecosystem': 'एकीकृत शैक्षणिक पारिस्थितिकी तंत्र',
    'landing.badge_roles': 'विद्यार्थी • संस्थान • शिक्षाविद',
    'landing.hero_title': 'अपने पाठ्यक्रम में महारत हासिल करें। व्यक्तिगत रुचियों का अन्वेषण करें। एक एकीकृत मंच।',
    'landing.hero_desc': 'विद्यासारथी औपचारिक शिक्षा और लचीले व्यक्तिगत अध्ययन को एक साथ लाता है। अपने संस्थान के पाठ्यक्रम का पालन करें, परीक्षा की तैयारी की निगरानी करें, अनुकूली शिक्षण द्वारा नए कौशल सीखें और आधुनिक शैक्षणिक अनुसंधानों से सीधे जुड़ें।',
    'landing.btn_gateway': 'समर्पित पोर्टल गेटवे पर जाएं ↓',
    'landing.btn_register': 'शुरू करें (पंजीकरण) →',

    // Landing Page Stats
    'landing.stat_curriculum': 'पाठ्यक्रम + अतिरिक्त शिक्षण',
    'landing.stat_readiness': 'गतिशील परीक्षा तत्परता',
    'landing.stat_weak': 'कमजोर विषयों का लक्षित अभ्यास',
    'landing.stat_discussions': 'शिक्षाविद अनुसंधान संवाद',

    // Landing Page Three Pillars
    'landing.pillars_title': 'तीन स्तंभ। एक एकीकृत शैक्षणिक पारिस्थितिकी तंत्र।',
    'landing.pillars_desc': 'विद्यार्थियों के अध्ययन, संस्थानों की निगरानी और शिक्षाविदों के शोध का सहज समन्वय।',
    'landing.pillar_student_title': 'विद्यार्थी पारिस्थितिकी',
    'landing.pillar_student_desc': 'पाठ्यक्रम, अतिरिक्त कौशल, पाठ्यक्रम प्रगति और परीक्षाओं का प्रबंधन करें।',
    'landing.pillar_institute_title': 'संस्थान पारिस्थितिकी',
    'landing.pillar_institute_desc': 'शैक्षणिक कार्यक्रम, अंक प्रबंधन, विद्यार्थी निगरानी और परामर्श।',
    'landing.pillar_academician_title': 'शिक्षाविद पारिस्थितिकी',
    'landing.pillar_academician_desc': 'शोध पत्र प्रकाशित करें और विद्यार्थियों के साथ सीधे संवाद करें।',

    // Landing Page Dual-Track
    'landing.diff_tag': 'विद्यासारथी की विशेषता',
    'landing.diff_title': 'दोहरा अध्ययन पथ: पाठ्यक्रम + व्यक्तिगत रुचि',
    'landing.diff_desc': 'अधिकांश मंच या तो छात्रों को एक ही पाठ्यक्रम में बांध देते हैं या कॉलेज पाठ्यक्रम को नजरअंदाज करते हैं। विद्यासारथी दोनों में संतुलन बनाता है:',
    'landing.track_a_badge': 'ट्रैक ए: शैक्षणिक पाठ्यक्रम',
    'landing.track_a_title': 'कॉलेज और स्कूल पाठ्यक्रम प्रबंधन',
    'landing.track_a_item1_strong': 'पाठ्यक्रम प्रगति और फिट स्कोर:',
    'landing.track_a_item1_text': 'सटीक रूप से जानें कि आपका कितना प्रतिशत पाठ्यक्रम पूर्ण हो चुका है।',
    'landing.track_a_item2_strong': 'कमजोर विषय की पहचान:',
    'landing.track_a_item2_text': 'प्रणाली परीक्षा अंकों का विश्लेषण कर दैनिक अभ्यास परीक्षाएं तैयार करती है।',
    'landing.track_a_item3_strong': 'संस्थान समय सारणी सिंक:',
    'landing.track_a_item3_text': 'कक्षाएं, मध्यावधि परीक्षाएं और व्यावहारिक कार्यक्रम सीधे आपके डैशबोर्ड पर।',
    'landing.track_a_item4_strong': 'संस्थान परामर्श और शंका निवारण:',
    'landing.track_a_item4_text': 'संकाय से सीधे शैक्षणिक प्रश्न पूछें और समाधान प्राप्त करें।',

    'landing.track_b_badge': 'ट्रैक बी: अतिरिक्त शिक्षण',
    'landing.track_b_title': 'व्यक्तिगत रुचियां, नई प्रौद्योगिकियां और कौशल',
    'landing.track_b_item1_strong': 'विविध विषय:',
    'landing.track_b_item1_text': 'पायथन, एआई, रोबोटिक्स, डेटा साइंस, वेब डेवलपमेंट, फाइनेंस और डिजाइन।',
    'landing.track_b_item2_strong': 'प्रारंभिक ज्ञान मूल्यांकन:',
    'landing.track_b_item2_text': 'प्रारंभिक नैदानिक परीक्षण द्वारा आपकी शुरुआत का स्तर तय होता है।',
    'landing.track_b_item3_strong': 'अनुकूली अध्ययन पथ:',
    'landing.track_b_item3_text': 'चरणबद्ध विषय जो अभ्यास के आधार पर आगे बढ़ते हैं या पुनरीक्षण प्रदान करते हैं।',
    'landing.track_b_item4_strong': 'AI-सहायता प्राप्त समय सारणी:',
    'landing.track_b_item4_text': 'संस्थान कार्यक्रम, अतिरिक्त अध्ययन और खेलकूद का संतुलित मिश्रण।',

    // Landing Page Flow & Gateway
    'landing.flow_title': 'विभिन्न भूमिकाओं के बीच सूचना का प्रवाह',
    'landing.flow_desc': 'शैक्षणिक कार्यक्रम, दैनिक अध्ययन अपडेट, प्रारंभिक परीक्षण और शोध चर्चाएं एक निरंतर विकास चक्र बनाती हैं।',
    'landing.gateway_tag': 'एकीकृत मंच पहुंच',
    'landing.gateway_title': 'समर्पित पोर्टल गेटवे',
    'landing.gateway_desc': 'अपने विशेष कार्यक्षेत्र, उपकरण और विश्लेषण देखने के लिए अपनी भूमिका चुनें।',
    'landing.btn_enter_student': 'विद्यार्थी पोर्टल में प्रवेश करें',
    'landing.btn_enter_institute': 'संस्थान पोर्टल में प्रवेश करें',
    'landing.btn_enter_academician': 'शिक्षाविद पोर्टल में प्रवेश करें',
    'landing.footer_text': '© 2026 विद्यासारथी — लचीला शैक्षणिक पारिस्थितिकी तंत्र और कौशल मंच।',

    // Meters & Key Metrics
    'meter.exam_target': 'परीक्षा पाठ्यक्रम लक्ष्य मीटर',
    'meter.skill_growth': 'कौशल तैयारी और विकास मीटर',
    'meter.potential_index': 'शैक्षणिक क्षमता सूचकांक',
    'meter.syllabus_covered': 'पाठ्यक्रम पूर्ण',
    'meter.progress_rate': 'दैनिक प्रगति दर',
    'meter.overall_fit': 'समग्र फिट स्कोर (परीक्षा तत्परता)',
    'meter.distance_traveled': 'तय की गई दूरी',
    'meter.fit_score': 'परीक्षा तत्परता (फिट स्कोर)',
    'meter.days_left': 'दिन शेष',
    'meter.on_track': 'सही गति पर',
    'meter.baseline': 'प्रारंभिक आधार',
    'meter.current': 'वर्तमान दक्षता',
    'meter.growth': 'कुल वृद्धि',

    // Actions & Buttons
    'action.complete_intake': 'प्रवेश विवरण भरें',
    'action.daily_update': 'आज के विषय दर्ज करें',
    'action.today_quiz': 'आज की अभ्यास परीक्षा',
    'action.generate_timetable': 'AI समय सारणी बनाएं',
    'action.report_gap': 'ज्ञान अंतर की रिपोर्ट करें',
    'action.start_diagnostic': 'प्रारंभिक मूल्यांकन शुरू करें',
    'action.start_practice': 'दैनिक अभ्यास परीक्षा दें',
    'action.save': 'परिवर्तन सहेजें',
    'action.submit': 'जमा करें',
    'action.cancel': 'रद्द करें',
    'action.back': 'वापस',

    // Greetings & Alerts
    'greeting.welcome': 'विद्यासारथी में आपका स्वागत है',
    'greeting.welcome_back': 'वापसी पर स्वागत है',
    'greeting.action_required': 'कार्रवाई आवश्यक • प्रारंभिक प्रोफाइल विवरण',
    'greeting.dual_track_desc': 'दोहरा शैक्षणिक और कौशल डैशबोर्ड। आप आगामी परीक्षाओं के लिए सही दिशा में हैं।',
    'greeting.intake_desc': 'अपने दोहरे पाठ्यक्रम, AI समय सारणी और परीक्षणों को कैलिब्रेट करने के लिए विवरण भरें।',
    'alert.weak_subjects': 'कमजोर विषयों की पहचान हुई',
  },
};

// =========================================================================
// TRANSLATION HELPER FUNCTIONS
// =========================================================================

export const resolveTranslation = (
  textOrKey: string,
  targetLang: SupportedLanguage,
  params?: Record<string, string | number>
): string => {
  if (!textOrKey) return '';
  if (targetLang === 'en') {
    let result = TRANSLATIONS.en[textOrKey] || textOrKey;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return result;
  }

  // 1. Direct key match in TRANSLATIONS
  if (TRANSLATIONS[targetLang] && TRANSLATIONS[targetLang][textOrKey]) {
    let res = TRANSLATIONS[targetLang][textOrKey];
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        res = res.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return res;
  }

  // 2. Exact match in GLOBAL_PHRASES
  if (GLOBAL_PHRASES[textOrKey] && GLOBAL_PHRASES[textOrKey][targetLang]) {
    let res = GLOBAL_PHRASES[textOrKey][targetLang];
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        res = res.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return res;
  }

  // 3. Normalized trimmed match in GLOBAL_PHRASES
  const trimmed = textOrKey.trim();
  if (GLOBAL_PHRASES[trimmed] && GLOBAL_PHRASES[trimmed][targetLang]) {
    return GLOBAL_PHRASES[trimmed][targetLang];
  }

  // 4. Case-insensitive lookup in DAYS, MONTHS, SUBJECTS, STATUSES
  const lower = trimmed.toLowerCase();
  if (DAYS_DICT[lower] && DAYS_DICT[lower][targetLang]) {
    return DAYS_DICT[lower][targetLang];
  }
  if (MONTHS_DICT[lower] && MONTHS_DICT[lower][targetLang]) {
    return MONTHS_DICT[lower][targetLang];
  }
  if (SUBJECTS_DICT[lower] && SUBJECTS_DICT[lower][targetLang]) {
    return SUBJECTS_DICT[lower][targetLang];
  }
  if (STATUSES_DICT[lower] && STATUSES_DICT[lower][targetLang]) {
    return STATUSES_DICT[lower][targetLang];
  }

  // 5. Check if it's an English translation key value
  for (const [key, val] of Object.entries(TRANSLATIONS.en)) {
    if (val === textOrKey || val.trim() === trimmed) {
      if (TRANSLATIONS[targetLang]?.[key]) {
        return TRANSLATIONS[targetLang][key];
      }
    }
  }

  // 6. Template replacements for common dynamic UI patterns
  if (targetLang === 'gu') {
    if (trimmed.startsWith('Institute Official Schedule (')) {
      const day = trimmed.slice(28, -1);
      const translatedDay = DAYS_DICT[day.toLowerCase()]?.gu || day;
      return `સંસ્થા સત્તાવાર સમયપત્રક (${translatedDay})`;
    }
    if (trimmed.startsWith('Personal Learning & Recovery Slots (')) {
      const day = trimmed.slice(36, -1);
      const translatedDay = DAYS_DICT[day.toLowerCase()]?.gu || day;
      return `વ્યક્તિગત અભ્યાસ અને રિકવરી સ્લોટ્સ (${translatedDay})`;
    }
    if (trimmed.startsWith('Today is ')) {
      const day = trimmed.slice(9);
      const translatedDay = DAYS_DICT[day.toLowerCase()]?.gu || day;
      return `આજે ${translatedDay} છે`;
    }
    if (trimmed.startsWith('Targeted Practice Quiz: ')) {
      const subj = trimmed.slice(24);
      const transSubj = SUBJECTS_DICT[subj.toLowerCase()]?.gu || subj;
      return `લક્ષિત પ્રેક્ટિસ ક્વિઝ: ${transSubj}`;
    }
    if (trimmed.startsWith('Quiz Results: ')) {
      const subj = trimmed.slice(14);
      const transSubj = SUBJECTS_DICT[subj.toLowerCase()]?.gu || subj;
      return `ક્વિઝ પરિણામ: ${transSubj}`;
    }
    if (trimmed.includes('Deficit Topics (') && trimmed.includes('hrs deficit)')) {
      return trimmed.replace('Deficit Topics', 'બાકી વિષયો').replace('hrs deficit', 'કલાક બાકી');
    }
    if (trimmed.startsWith('No official classes scheduled for ')) {
      const rest = trimmed.replace('No official classes scheduled for ', '');
      const day = rest.split('.')[0];
      const translatedDay = DAYS_DICT[day.toLowerCase()]?.gu || day;
      return `${translatedDay} માટે કોઈ સત્તાવાર ક્લાસ નિર્ધારિત નથી.`;
    }
  } else if (targetLang === 'hi') {
    if (trimmed.startsWith('Institute Official Schedule (')) {
      const day = trimmed.slice(28, -1);
      const translatedDay = DAYS_DICT[day.toLowerCase()]?.hi || day;
      return `संस्थान आधिकारिक समय सारणी (${translatedDay})`;
    }
    if (trimmed.startsWith('Personal Learning & Recovery Slots (')) {
      const day = trimmed.slice(36, -1);
      const translatedDay = DAYS_DICT[day.toLowerCase()]?.hi || day;
      return `व्यक्तिगत अध्ययन और रिकवरी स्लॉट (${translatedDay})`;
    }
    if (trimmed.startsWith('Today is ')) {
      const day = trimmed.slice(9);
      const translatedDay = DAYS_DICT[day.toLowerCase()]?.hi || day;
      return `आज ${translatedDay} है`;
    }
    if (trimmed.startsWith('Targeted Practice Quiz: ')) {
      const subj = trimmed.slice(24);
      const transSubj = SUBJECTS_DICT[subj.toLowerCase()]?.hi || subj;
      return `लक्षित अभ्यास क्विज़: ${transSubj}`;
    }
    if (trimmed.startsWith('Quiz Results: ')) {
      const subj = trimmed.slice(14);
      const transSubj = SUBJECTS_DICT[subj.toLowerCase()]?.hi || subj;
      return `क्विज़ परिणाम: ${transSubj}`;
    }
    if (trimmed.includes('Deficit Topics (') && trimmed.includes('hrs deficit)')) {
      return trimmed.replace('Deficit Topics', 'लंबित विषय').replace('hrs deficit', 'घंटे शेष');
    }
    if (trimmed.startsWith('No official classes scheduled for ')) {
      const rest = trimmed.replace('No official classes scheduled for ', '');
      const day = rest.split('.')[0];
      const translatedDay = DAYS_DICT[day.toLowerCase()]?.hi || day;
      return `${translatedDay} के लिए कोई आधिकारिक कक्षा निर्धारित नहीं है।`;
    }
  }

  return textOrKey;
};

// =========================================================================
// CONTEXT CREATION & PROVIDER
// =========================================================================

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (keyOrText: string, params?: Record<string, string | number>) => string;
  tDay: (day: string) => string;
  tMonth: (month: string) => string;
  tSubject: (subject: string) => string;
  tStatus: (status: string) => string;
  formatDate: (date: string | Date | number, options?: Intl.DateTimeFormatOptions) => string;
  formatTime: (timeStr: string) => string;
  languages: LanguageOption[];
  currentLangMeta: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// DOM Translation Cache to remember original English text of nodes
const originalTextMap = new WeakMap<Node, string>();
const originalAttrMap = new WeakMap<Element, Record<string, string>>();

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('vidyasarthi_lang') as SupportedLanguage;
    if (saved && (saved === 'en' || saved === 'gu' || saved === 'hi')) return saved;
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    if (lang === 'en' || lang === 'gu' || lang === 'hi') {
      setLanguageState(lang);
      localStorage.setItem('vidyasarthi_lang', lang);
    }
  };

  const t = (keyOrText: string, params?: Record<string, string | number>): string => {
    return resolveTranslation(keyOrText, language, params);
  };

  const tDay = (day: string): string => {
    if (!day) return '';
    const lower = day.trim().toLowerCase();
    return DAYS_DICT[lower]?.[language] || day;
  };

  const tMonth = (month: string): string => {
    if (!month) return '';
    const lower = month.trim().toLowerCase();
    return MONTHS_DICT[lower]?.[language] || month;
  };

  const tSubject = (subject: string): string => {
    if (!subject) return '';
    const lower = subject.trim().toLowerCase();
    return SUBJECTS_DICT[lower]?.[language] || resolveTranslation(subject, language);
  };

  const tStatus = (status: string): string => {
    if (!status) return '';
    const lower = status.trim().toLowerCase();
    return STATUSES_DICT[lower]?.[language] || resolveTranslation(status, language);
  };

  const formatDate = (date: string | Date | number, options?: Intl.DateTimeFormatOptions): string => {
    try {
      const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
      const locale = language === 'gu' ? 'gu-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      return new Intl.DateTimeFormat(locale, options || { day: 'numeric', month: 'short', year: 'numeric' }).format(d);
    } catch {
      return String(date);
    }
  };

  const formatTime = (timeStr: string): string => {
    if (!timeStr) return '';
    if (language === 'en') return timeStr;
    let res = timeStr;
    if (language === 'gu') {
      res = res.replace(/AM/gi, 'સવારે').replace(/PM/gi, 'સાંજે');
    } else if (language === 'hi') {
      res = res.replace(/AM/gi, 'सुबह').replace(/PM/gi, 'शाम');
    }
    return res;
  };

  // =========================================================================
  // AUTOMATIC FULL DOM TRANSLATOR EFFECT (ZERO LEFTOVER ENGLISH)
  // =========================================================================
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const currentLang = language;
    document.documentElement.lang = currentLang;

    // Helper to translate an element and all child text nodes
    const processNode = (node: Node) => {
      // Handle text nodes
      if (node.nodeType === Node.TEXT_NODE) {
        const textNode = node as Text;
        const text = textNode.nodeValue || '';
        const trimmed = text.trim();
        if (!trimmed || trimmed.length === 0) return;

        // Skip script and style tags
        const parentTag = textNode.parentElement?.tagName?.toLowerCase();
        if (parentTag === 'script' || parentTag === 'style') return;

        if (currentLang === 'en') {
          if (originalTextMap.has(textNode)) {
            textNode.nodeValue = originalTextMap.get(textNode)!;
          }
        } else {
          let original = originalTextMap.get(textNode);
          if (!original) {
            original = text;
            originalTextMap.set(textNode, original);
          }
          const origTrimmed = original.trim();
          if (origTrimmed.length > 0) {
            const translated = resolveTranslation(origTrimmed, currentLang);
            if (translated !== origTrimmed) {
              const leadingWs = original.match(/^\s*/)?.[0] || '';
              const trailingWs = original.match(/\s*$/)?.[0] || '';
              textNode.nodeValue = leadingWs + translated + trailingWs;
            }
          }
        }
        return;
      }

      // Handle element attributes
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tag = el.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style') return;

        // Placeholders on input / textarea
        if (el.hasAttribute('placeholder')) {
          const ph = el.getAttribute('placeholder') || '';
          if (currentLang === 'en') {
            const saved = originalAttrMap.get(el);
            if (saved && saved.placeholder) {
              el.setAttribute('placeholder', saved.placeholder);
            }
          } else {
            let saved = originalAttrMap.get(el);
            if (!saved) {
              saved = {};
              originalAttrMap.set(el, saved);
            }
            if (!saved.placeholder) {
              saved.placeholder = ph;
            }
            const translated = resolveTranslation(saved.placeholder.trim(), currentLang);
            if (translated !== saved.placeholder.trim()) {
              el.setAttribute('placeholder', translated);
            }
          }
        }

        // Titles and aria-labels
        if (el.hasAttribute('title')) {
          const title = el.getAttribute('title') || '';
          if (currentLang === 'en') {
            const saved = originalAttrMap.get(el);
            if (saved && saved.title) el.setAttribute('title', saved.title);
          } else {
            let saved = originalAttrMap.get(el);
            if (!saved) { saved = {}; originalAttrMap.set(el, saved); }
            if (!saved.title) saved.title = title;
            const translated = resolveTranslation(saved.title.trim(), currentLang);
            if (translated !== saved.title.trim()) el.setAttribute('title', translated);
          }
        }

        // Recursively translate child nodes
        for (let i = 0; i < el.childNodes.length; i++) {
          processNode(el.childNodes[i]);
        }
      }
    };

    // Run translation on document body
    let isProcessing = false;
    const runTranslation = () => {
      if (isProcessing) return;
      isProcessing = true;
      try {
        processNode(document.body);
      } finally {
        isProcessing = false;
      }
    };

    runTranslation();

    // Set up MutationObserver to translate any newly mounted nodes or DOM mutations
    const observer = new MutationObserver((mutations) => {
      if (isProcessing) return;
      isProcessing = true;
      try {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => processNode(node));
          } else if (mutation.type === 'characterData' && mutation.target) {
            processNode(mutation.target);
          } else if (mutation.type === 'attributes' && mutation.target) {
            processNode(mutation.target);
          }
        });
      } finally {
        isProcessing = false;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label'],
    });

    return () => {
      observer.disconnect();
    };
  }, [language]);

  const currentLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        tDay,
        tMonth,
        tSubject,
        tStatus,
        formatDate,
        formatTime,
        languages: SUPPORTED_LANGUAGES,
        currentLangMeta,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
