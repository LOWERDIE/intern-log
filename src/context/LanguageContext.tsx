'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'TH' | 'EN';

interface LanguageContextType {
    language: Language;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
    'welcome_back': {
        'EN': 'Welcome back',
        'TH': 'ยินดีต้อนรับกลับ'
    },
    'internship_log': {
        'EN': 'Internship Log',
        'TH': 'บันทึกฝึกงาน'
    },
    'sign_out': {
        'EN': 'Sign Out',
        'TH': 'ออกจากระบบ'
    },
    'new_entry': {
        'EN': 'New Entry',
        'TH': 'บันทึกใหม่'
    },
    'date': {
        'EN': 'Date',
        'TH': 'วันที่'
    },
    'description': {
        'EN': 'Description',
        'TH': 'รายละเอียด'
    },
    'save_entry': {
        'EN': 'Save Entry',
        'TH': 'บันทึกข้อมูล'
    },
    'recent_logs': {
        'EN': 'Recent Logs',
        'TH': 'บันทึกล่าสุด'
    },
    'export_excel': {
        'EN': 'Export to Excel',
        'TH': 'ส่งออกเป็น Excel'
    },
    'no_logs': {
        'EN': 'No logs found.',
        'TH': 'ไม่พบข้อมูลบันทึก'
    },
    'start_adding': {
        'EN': 'Start by adding your first entry!',
        'TH': 'เริ่มต้นด้วยการเพิ่มบันทึกแรกของคุณ!'
    },
    'placeholder_desc': {
        'EN': 'What did you learn today?',
        'TH': 'วันนี้เรียนรู้อะไรบ้าง?'
    },
    'view_list': {
        'EN': 'List View',
        'TH': 'มุมมองรายการ'
    },
    'view_table': {
        'EN': 'Table View',
        'TH': 'มุมมองตาราง'
    },
    'delete': {
        'EN': 'Delete',
        'TH': 'ลบข้อมูล'
    },
    'select_all': {
        'EN': 'Select All',
        'TH': 'เลือกทั้งหมด'
    },
    'selected': {
        'EN': 'Selected',
        'TH': 'เลือกแล้ว'
    },
    'confirm_delete_title': {
        'EN': 'Confirm Deletion',
        'TH': 'ยืนยันการลบ'
    },
    'confirm_delete_msg': {
        'EN': 'Are you sure you want to delete the selected logs? This action cannot be undone.',
        'TH': 'คุณแน่ใจหรือไม่ที่จะลบข้อมูลที่เลือก? การกระทำนี้ไม่สามารถย้อนกลับได้'
    },
    'type_confirm': {
        'EN': 'Type "confirm" to proceed',
        'TH': 'พิมพ์ "ยืนยัน" เพื่อดำเนินการต่อ'
    },
    'confirm_keyword': {
        'EN': 'confirm',
        'TH': 'ยืนยัน'
    },
    'cancel': {
        'EN': 'Cancel',
        'TH': 'ยกเลิก'
    },
    'log_details': {
        'EN': 'Log Details',
        'TH': 'รายละเอียดบันทึก'
    },
    'close': {
        'EN': 'Close',
        'TH': 'ปิด'
    },
    'edit_entry': {
        'EN': 'Edit Entry',
        'TH': 'แก้ไขบันทึก'
    },
    'save_changes': {
        'EN': 'Save Changes',
        'TH': 'บันทึกการแก้ไข'
    },
    'hours': {
        'EN': 'Hours',
        'TH': 'ชั่วโมง'
    },
    'hours_suffix': {
        'EN': 'hrs',
        'TH': 'ชม.'
    },
    'total_summary': {
        'EN': 'Total Summary',
        'TH': 'สรุปผลการฝึกงาน'
    },
    'days': {
        'EN': 'Days',
        'TH': 'วัน'
    },
    'months': {
        'EN': 'Months',
        'TH': 'จำนวนเดือน'
    },
    'total_hours': {
        'EN': 'Total Hours',
        'TH': 'ชั่วโมงทั้งหมด'
    },
    'work_days': {
        'EN': 'Work Days',
        'TH': 'วันทำงาน'
    },
    'days_off': {
        'EN': 'Days Off',
        'TH': 'วันหยุด/ลา'
    },
    'months_suffix': {
        'EN': 'months',
        'TH': 'เดือน'
    },
    'days_suffix': {
        'EN': 'days',
        'TH': 'วัน'
    },
    'total_internship_time': {
        'EN': 'Total Internship Time',
        'TH': 'เวลาฝึกงานทั้งหมด'
    },
    'work_link': {
        'EN': 'Work Link (Optional)',
        'TH': 'ลิงก์งาน (ไม่บังคับ)'
    },
    'view_work': {
        'EN': 'View Work',
        'TH': 'ดูผลงาน'
    },
    'custom': {
        'EN': 'Custom',
        'TH': 'กำหนดเอง'
    },
    'holiday_leave': {
        'EN': 'Holiday / Leave',
        'TH': 'วันหยุด / ลา'
    },
    'status': {
        'EN': 'Status',
        'TH': 'สถานะ'
    },
    'status_work': {
        'EN': 'Work',
        'TH': 'ทำงาน'
    },
    'status_holiday': {
        'EN': 'Holiday / Leave',
        'TH': 'วันหยุด / ลา'
    },
    'work_description': {
        'EN': 'Work Description',
        'TH': 'รายละเอียดงาน'
    }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('TH'); // Default to Thai

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'TH' ? 'EN' : 'TH');
    };

    const t = (key: string) => {
        return translations[key]?.[language] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
