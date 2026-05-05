const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://pbakivsswqxctyfnqscj.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiYWtpdnNzd3F4Y3R5Zm5xc2NqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzM3NDk1NiwiZXhwIjoyMDkyOTUwOTU2fQ.RX7zUJNbcQMhu6-uba2wJj1q9GSoUNdaWeQtwzlX-6o';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const DEMO_EMAIL = 'demo@lifereflection.app';
const DEMO_PASSWORD = 'demo1234!';

const MOODS = ['😊', '😔', '😤', '🥰', '😴', '🤔', '😌', '🥺', '🎉', '☁️', '🌸', '✨'];
const PAPER_STYLES = ['plain', 'lined', 'grid', 'vintage'];
const TAGS = ['ชีวิต', 'งาน', 'ครอบครัว', 'ท่องเที่ยว', 'อาหาร', 'ความฝัน', 'สุขภาพ', 'เพื่อน', 'ความรัก', 'ธรรมชาติ'];

const FAKE_ENTRIES = [
  { title: 'วันแรกของการเดินทาง', content: '<p>วันนี้ออกเดินทางไปเชียงใหม่ครั้งแรก อากาศเย็นสบายมาก ไปเดินถนนคนเดินกินข้าวซอยอร่อยมาก ❤️ รู้สึกว่าชีวิตช่างสวยงามเมื่อได้ออกมาจากกรอบเดิมๆ</p>', mood: '🌸', paper: 'vintage', tags: ['ท่องเที่ยว', 'ความฝัน'], daysAgo: 365 },
  { title: 'งานนำเสนอสำเร็จแล้ว', content: '<p>วันนี้นำเสนองานต่อบอร์ดสำเร็จ! ใช้เวลาเตรียมมา 3 อาทิตย์ ตอนยืนหน้าห้องใจเต้นแรงมาก แต่สุดท้ายทุกอย่างก็ราบรื่น ผู้จัดการชมด้วย 😊</p>', mood: '🎉', paper: 'plain', tags: ['งาน'], daysAgo: 340 },
  { title: 'ฝนตกทั้งวัน', content: '<p>วันนี้อยู่บ้านทั้งวันเพราะฝนตกหนัก อ่านหนังสือไป ดูซีรีส์ไป ทำกับข้าวเองที่บ้าน รู้สึกสงบดีแปลกๆ บางทีการได้อยู่กับตัวเองก็ดีไม่น้อย</p>', mood: '😌', paper: 'lined', tags: ['ชีวิต'], daysAgo: 320 },
  { title: 'วันเกิดแม่', content: '<p>พาแม่ไปกินข้าวร้านโปรดของเธอ เห็นแม่ยิ้มแล้วรู้สึกอบอุ่นมาก แม่บอกว่าขอแค่ลูกๆ สุขภาพดีก็พอ ทำให้นึกถึงว่าเราโตมาด้วยความรักของเธอ</p>', mood: '🥰', paper: 'vintage', tags: ['ครอบครัว', 'ความรัก'], daysAgo: 300 },
  { title: 'เริ่มออกกำลังกาย', content: '<p>ตัดสินใจสมัครฟิตเนสเสียที หลังจากผัดวันมาหลายเดือน วันแรกเดินสายพานแค่ 30 นาทีก็เหนื่อยแล้ว แต่รู้สึกดีหลังทำ ตั้งใจจะทำให้ได้สัปดาห์ละ 3 วัน</p>', mood: '💪', paper: 'grid', tags: ['สุขภาพ'], daysAgo: 280 },
  { title: 'เจอเพื่อนเก่า', content: '<p>นัดเจอเพื่อนสมัยมหาวิทยาลัยหลังจากไม่ได้เจอกัน 2 ปี คุยกันไม่รู้เรื่องตั้งแต่บ่ายถึงดึก เวลาผ่านไปแต่มิตรภาพไม่เคยจาง บางทีความสัมพันธ์แบบนี้มันพิเศษจริงๆ</p>', mood: '😊', paper: 'plain', tags: ['เพื่อน', 'ชีวิต'], daysAgo: 260 },
  { title: 'ความฝันแปลกๆ', content: '<p>คืนก่อนฝันว่าตัวเองกำลังบินอยู่เหนือทะเล แล้วก็มีเกาะเล็กๆ ที่มีแต่ต้นไม้ ไม่มีใครเลยนอกจากตัวเอง ตื่นขึ้นมาแล้วยังรู้สึกอิสระอยู่เลย อยากรู้ว่าฝันแบบนี้หมายความว่าอะไร</p>', mood: '🤔', paper: 'vintage', tags: ['ความฝัน'], daysAgo: 250 },
  { title: 'ทดลองทำอาหารใหม่', content: '<p>วันนี้ทำพาสต้าคาโบนาร่าเป็นครั้งแรก ใช้ไข่แดง ชีสพาร์มาซาน เบคอน แล้วก็พาสต้า ออกมาดีเกินคาด! จะลองทำอีกครั้งเพื่อปรับปรุงสูตร</p>', mood: '😊', paper: 'grid', tags: ['อาหาร'], daysAgo: 240 },
  { title: 'วันที่ท้อแท้', content: '<p>วันนี้รู้สึกหนักมาก งานเยอะ กดดัน ไม่รู้จะระบายกับใคร เลยเขียนมาที่นี่แทน บางทีชีวิตมันก็มีวันที่ทุกอย่างดูยากไปหมด แต่เชื่อว่าพรุ่งนี้จะดีขึ้น</p>', mood: '😔', paper: 'lined', tags: ['ชีวิต'], daysAgo: 230 },
  { title: 'หนังสือเล่มโปรด', content: '<p>อ่านหนังสือ The Alchemist จบแล้ว ชอบมากๆ ประโยคที่ประทับใจที่สุดคือ "When you want something, all the universe conspires in helping you to achieve it." จะเก็บไว้จำ</p>', mood: '✨', paper: 'vintage', tags: ['ชีวิต', 'ความฝัน'], daysAgo: 220 },
  { title: 'ปีใหม่ปีนี้', content: '<p>นั่งมองดอกไม้ไฟตอนเที่ยงคืน รู้สึกตื้นตันอย่างบอกไม่ถูก ปีที่ผ่านมาผ่านอะไรมาเยอะมาก ปีนี้ตั้งใจจะดูแลตัวเองให้ดีขึ้น ใช้เวลาให้มีคุณค่า และรักคนรอบข้างให้มากขึ้น</p>', mood: '🎉', paper: 'plain', tags: ['ชีวิต', 'ความฝัน'], daysAgo: 210 },
  { title: 'สวนสาธารณะยามเช้า', content: '<p>ตื่นแต่เช้าไปวิ่งในสวนสาธารณะ อากาศดีมาก มีนกกระจิบส่งเสียงร้อง แสงแดดตอนเช้านุ่มๆ รู้สึกว่าโลกนี้สวยงามเมื่อเราหยุดอยู่กับมัน</p>', mood: '🌸', paper: 'plain', tags: ['ธรรมชาติ', 'สุขภาพ'], daysAgo: 200 },
  { title: 'เรียนภาษาใหม่', content: '<p>เริ่มเรียนภาษาญี่ปุ่นบน Duolingo วันแรกเรียนตัวอักษรฮิรางานะ อยากไปเที่ยวญี่ปุ่นด้วยตัวเองโดยไม่ต้องพึ่งทัวร์ คิดว่าต้องใช้เวลาสัก 1 ปีถึงจะพอสื่อสารได้</p>', mood: '🤔', paper: 'grid', tags: ['ชีวิต', 'ความฝัน'], daysAgo: 190 },
  { title: 'ฉลองเลื่อนตำแหน่ง', content: '<p>วันนี้ได้รับการเลื่อนตำแหน่งอย่างเป็นทางการ! ทำงานมา 3 ปีกว่าสุดท้ายก็ถึงเวลา ออกไปกินข้าวฉลองกับเพื่อนร่วมงาน รู้สึกขอบคุณทุกคนที่สนับสนุนมาตลอด</p>', mood: '🎉', paper: 'plain', tags: ['งาน'], daysAgo: 180 },
  { title: 'ทะเลในยามพระอาทิตย์ตก', content: '<p>นั่งดูพระอาทิตย์ตกที่ชายหาดประจวบฯ ท้องฟ้าสีส้มแดง เสียงคลื่น กลิ่นทะเล ทุกอย่างทำให้รู้สึกว่าชีวิตนี้มีความหมาย อยากกลับมาที่นี่อีก</p>', mood: '🌸', paper: 'vintage', tags: ['ท่องเที่ยว', 'ธรรมชาติ'], daysAgo: 170 },
  { title: 'วันอาทิตย์กับหนังสือ', content: '<p>ใช้เวลาทั้งวันนั่งอ่านหนังสืออยู่ที่ร้านกาแฟเล็กๆ ใกล้บ้าน อ่านไป 3 เล่ม ดื่มกาแฟไป 2 แก้ว ไม่ได้คุยกับใครทั้งวันแต่ก็ไม่รู้สึกเหงา บางทีการอยู่กับตัวเองก็เป็นสิ่งที่ต้องการ</p>', mood: '😌', paper: 'lined', tags: ['ชีวิต'], daysAgo: 160 },
  { title: 'ปลูกต้นไม้', content: '<p>วันนี้ซื้อต้นไม้มาปลูก 5 ต้น มีเฟิร์น กุหลาบ และไม้ประดับ จัดไว้ที่ระเบียงบ้าน รู้สึกว่าบ้านมีชีวิตขึ้นมาทันที ได้เรียนรู้ว่าการดูแลสิ่งมีชีวิตทำให้จิตใจสงบได้</p>', mood: '🌿', paper: 'grid', tags: ['ธรรมชาติ'], daysAgo: 150 },
  { title: 'คืนที่นอนไม่หลับ', content: '<p>ตีสองแล้วยังนอนไม่หลับ ความคิดวนเวียนในหัว เรื่องงาน เรื่องอนาคต เรื่องที่ยังทำไม่เสร็จ เปิดหน้าต่างมองดาว รู้สึกว่าดาวเหล่านั้นก็ผ่านมาหลายพันล้านปี ปัญหาของเราเล็กนิดเดียว</p>', mood: '☁️', paper: 'lined', tags: ['ชีวิต'], daysAgo: 140 },
  { title: 'กินราเมนคืนนี้', content: '<p>ไปกินราเมนร้านใหม่ที่เพิ่งเปิด ซุปเข้มข้นมาก ไข่ออนเซ็นหนืดสวย หมูชาชูนุ่มละลาย จ่ายแค่ 180 บาท คุ้มมากๆ จะกลับมาอีกแน่นอน</p>', mood: '😊', paper: 'plain', tags: ['อาหาร'], daysAgo: 130 },
  { title: 'วิดีโอโทรหาครอบครัว', content: '<p>วิดีโอคอลกับครอบครัวนานสองชั่วโมง เห็นหน้าแม่แล้วอยากกลับบ้าน น้องสาวโตขึ้นเยอะมาก พ่อเล่าเรื่องสวนหลังบ้าน รู้สึกว่าห่างกันแค่ทางกาย แต่ใจไม่เคยห่าง</p>', mood: '🥺', paper: 'vintage', tags: ['ครอบครัว'], daysAgo: 120 },
  { title: 'วิ่ง 5K แรก', content: '<p>วันนี้วิ่งครบ 5 กิโลเมตรโดยไม่หยุดพักเป็นครั้งแรกในชีวิต! ใช้เวลา 38 นาที ขาแทบขาด แต่รู้สึกภูมิใจมาก เริ่มจากคนที่วิ่ง 500 เมตรก็เหนื่อย มาถึงวันนี้ได้</p>', mood: '🎉', paper: 'grid', tags: ['สุขภาพ'], daysAgo: 110 },
  { title: 'หมู่บ้านเล็กๆ ในภูเขา', content: '<p>ขับรถขึ้นไปพักที่โฮมสเตย์บนดอย อากาศหนาว หมอกลง ชาวบ้านใจดีมาก กินข้าวเหนียวกับลาบร้อนๆ รู้สึกว่าชีวิตที่เรียบง่ายบางทีก็มีความสุขที่ซับซ้อนมากกว่า</p>', mood: '✨', paper: 'vintage', tags: ['ท่องเที่ยว', 'ธรรมชาติ'], daysAgo: 100 },
  { title: 'ดูหนังคนเดียว', content: '<p>ไปดูหนังคนเดียวในโรงครั้งแรก ตอนแรกกลัวว่าจะรู้สึกแปลก แต่จริงๆ แล้วมันดีมาก นั่งตรงกลาง กินป็อปคอร์น ไม่ต้องรอใคร ไม่ต้องพูดคุย ได้อยู่กับตัวเองอย่างเต็มที่</p>', mood: '😌', paper: 'plain', tags: ['ชีวิต'], daysAgo: 90 },
  { title: 'โปรเจกต์ข้างบ้าน', content: '<p>ช่วยเพื่อนบ้านทาสีรั้ว ทำงานด้วยกันทั้งวัน คุยกัน หัวเราะกัน สุดท้ายออกมาสวยดี ความรู้สึกได้ทำสิ่งที่มีประโยชน์ร่วมกับคนอื่นมันให้ความสุขแบบที่ซื้อไม่ได้</p>', mood: '😊', paper: 'grid', tags: ['เพื่อน', 'ชีวิต'], daysAgo: 80 },
  { title: 'วันเศร้าที่คาดไม่ถึง', content: '<p>ไม่รู้ทำไมวันนี้รู้สึกเศร้าโดยไม่มีสาเหตุ บางทีจิตใจก็ต้องการพักบ้างเหมือนกัน นั่งเงียบๆ ฟังเพลงเบาๆ ดูฝนตกนอกหน้าต่าง แล้วก็รู้สึกดีขึ้นทีละนิด</p>', mood: '😔', paper: 'lined', tags: ['ชีวิต'], daysAgo: 70 },
  { title: 'สูตรขนมปังบ้านๆ', content: '<p>ลองอบขนมปังเองเป็นครั้งแรก ใช้เวลาทั้งวัน นวดแป้ง รอพัก อบ ออกมาหน้าตาไม่สวยนัก แต่กลิ่นหอมมากและรสชาติดี รู้สึกว่ากระบวนการทำอาหารมันน่าหลงใหล</p>', mood: '🤔', paper: 'plain', tags: ['อาหาร'], daysAgo: 60 },
  { title: 'วันครบรอบมิตรภาพ', content: '<p>เพื่อนสนิทและฉันรู้จักกันมาครบ 10 ปีพอดี ทำเซอร์ไพรส์เล็กๆ ให้เขา ซื้อเค้กและเขียนการ์ด เขาเซอร์ไพรส์มากและเกือบร้องไห้ มิตรภาพแบบนี้คือสมบัติล้ำค่าที่สุดในชีวิต</p>', mood: '🥰', paper: 'vintage', tags: ['เพื่อน', 'ความรัก'], daysAgo: 50 },
  { title: 'ขยับบ้านใหม่', content: '<p>ย้ายเข้าห้องใหม่วันนี้ เหนื่อยมากแต่ตื่นเต้น ห้องเล็กกว่าเดิมแต่วิวดีกว่า เห็นทะเลได้จากระเบียง ตั้งของเสร็จแล้วนั่งมองออกไปข้างนอก รู้สึกว่าการเริ่มต้นใหม่มันน่าตื่นเต้นเสมอ</p>', mood: '✨', paper: 'grid', tags: ['ชีวิต'], daysAgo: 40 },
  { title: 'สวนดอกไม้', content: '<p>ไปเดินในสวนดอกไม้กับครอบครัว ดอกทิวลิปบานสะพรั่ง สีสันสวยงามมาก เด็กๆ วิ่งเล่น หัวเราะ บรรยากาศอบอุ่น รู้สึกว่าความสุขที่แท้จริงมันง่ายๆ แค่นี้เอง</p>', mood: '🌸', paper: 'plain', tags: ['ครอบครัว', 'ธรรมชาติ'], daysAgo: 25 },
  { title: 'สัปดาห์ที่ดีมาก', content: '<p>สัปดาห์นี้ทุกอย่างราบรื่นมาก งานเสร็จตามกำหนด สุขภาพดี นอนหลับพักผ่อนเพียงพอ ได้คุยกับคนที่รัก ถ้าทุกสัปดาห์เป็นแบบนี้ได้คงจะดีมาก ขอบคุณชีวิตสำหรับวันเหล่านี้</p>', mood: '😊', paper: 'vintage', tags: ['ชีวิต'], daysAgo: 10 },
  { title: 'วันนี้', content: '<p>เขียนบันทึกสั้นๆ ก่อนนอน วันนี้ไม่มีอะไรพิเศษ แต่ก็ไม่มีอะไรแย่ แค่วันธรรมดาที่ดำเนินไปอย่างสงบ บางทีวันธรรมดาเหล่านี้แหละที่เป็นความสุขที่แท้จริงของชีวิต</p>', mood: '😌', paper: 'lined', tags: ['ชีวิต'], daysAgo: 2 },
];

async function seed() {
  console.log('🌱 Starting seed...\n');

  // 1. Create demo user
  console.log('👤 Creating demo user...');
  const { data: userCreateData, error: createError } = await supabase.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { display_name: 'สมชาย ใจดี' }
  });

  let userId;
  if (createError) {
    if (createError.message.includes('already been registered')) {
      console.log('ℹ️  User already exists, fetching...');
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const existing = users.find(u => u.email === DEMO_EMAIL);
      userId = existing?.id;
    } else {
      console.error('❌ Error creating user:', createError);
      return;
    }
  } else {
    userId = userCreateData.user?.id;
  }

  if (!userId) {
    console.error('❌ Could not get user ID');
    return;
  }
  console.log(`✅ User ready: ${userId}\n`);

  // 2. Insert entries
  console.log(`📝 Inserting ${FAKE_ENTRIES.length} diary entries...`);
  let successCount = 0;

  for (const entry of FAKE_ENTRIES) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - entry.daysAgo);
    
    const { data: inserted, error: insertError } = await supabase
      .from('entries')
      .insert({
        title: entry.title,
        content: entry.content,
        mood: entry.mood,
        paper_style: entry.paper || 'plain',
        user_id: userId,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error(`  ❌ Failed: ${entry.title}`, insertError.message);
      continue;
    }

    // Insert tags
    for (const tagName of entry.tags) {
      // Get or create tag
      let { data: tag } = await supabase.from('tags').select('*').eq('name', tagName).single();
      if (!tag) {
        const colors = ['#8b6f47', '#c9a96e', '#7a9e7e', '#6b8cba', '#b06b6b', '#9b7bb8', '#c4a35a', '#5a9e8e'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const { data: newTag } = await supabase.from('tags').insert({ name: tagName, color }).select().single();
        tag = newTag;
      }
      if (tag) {
        await supabase.from('entry_tags').upsert({ entry_id: inserted.id, tag_id: tag.id }, { ignoreDuplicates: true });
      }
    }

    successCount++;
    process.stdout.write(`  ✅ [${successCount}/${FAKE_ENTRIES.length}] ${entry.title}\n`);
  }

  console.log(`\n🎉 Done! Inserted ${successCount} entries.`);
  console.log(`\n📧 Login credentials:`);
  console.log(`   Email: ${DEMO_EMAIL}`);
  console.log(`   Password: ${DEMO_PASSWORD}`);
}

seed().catch(console.error);
