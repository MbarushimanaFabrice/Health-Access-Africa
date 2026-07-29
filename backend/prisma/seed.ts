import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with Rwanda-based data...\n');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.healthInfo.deleteMany();
  await prisma.patientProfile.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('Password123!', 10);

  // ─── ADMIN ────────────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      fullName: 'Nkurunziza Alexis',
      email: 'admin@healthaccessafrica.rw',
      passwordHash: password,
      role: 'admin',
      phone: '+250788000001',
      district: 'Kigali',
      isActive: true,
    },
  });

  // ─── DOCTORS ──────────────────────────────────────────────────────────────
  const doctorData = [
    {
      fullName: 'Dr. Kagame Jean-Paul',
      email: 'dr.kagame@healthaccessafrica.rw',
      phone: '+250788000002',
      district: 'Kigali',
      specialty: 'General Medicine',
      hospital: 'King Faisal Hospital Kigali',
      bio: 'Experienced general practitioner with over 15 years serving patients in Kigali.',
      yearsExperience: 15,
    },
    {
      fullName: 'Dr. Mukamana Solange',
      email: 'dr.mukamana@healthaccessafrica.rw',
      phone: '+250788000003',
      district: 'Musanze',
      specialty: 'Pediatrics',
      hospital: 'Ruhengeri Hospital',
      bio: 'Dedicated pediatrician passionate about child health in Northern Rwanda.',
      yearsExperience: 10,
    },
    {
      fullName: 'Dr. Habimana Patrick',
      email: 'dr.habimana@healthaccessafrica.rw',
      phone: '+250788000004',
      district: 'Huye',
      specialty: 'Internal Medicine',
      hospital: 'CHUK (Centre Hospitalier Universitaire de Kigali)',
      bio: 'Internal medicine specialist trained at University of Rwanda.',
      yearsExperience: 8,
    },
    {
      fullName: 'Dr. Uwizeyimana Grace',
      email: 'dr.uwizeyimana@healthaccessafrica.rw',
      phone: '+250788000005',
      district: 'Rubavu',
      specialty: 'Obstetrics & Gynecology',
      hospital: 'Kibagabaga Hospital',
      bio: 'Specialist in maternal health, serving patients across Western Province.',
      yearsExperience: 12,
    },
    {
      fullName: 'Dr. Nshimiyimana Théodore',
      email: 'dr.nshimiyimana@healthaccessafrica.rw',
      phone: '+250788000006',
      district: 'Nyagatare',
      specialty: 'Surgery',
      hospital: 'Rwanda Military Hospital',
      bio: 'Surgical specialist dedicated to bringing advanced care to Eastern Province.',
      yearsExperience: 20,
    },
  ];

  const doctors = [];
  for (const d of doctorData) {
    const doctor = await prisma.user.create({
      data: {
        fullName: d.fullName,
        email: d.email,
        passwordHash: password,
        role: 'doctor',
        phone: d.phone,
        district: d.district,
        isActive: true,
        doctorProfile: {
          create: {
            specialty: d.specialty,
            hospital: d.hospital,
            bio: d.bio,
            yearsExperience: d.yearsExperience,
          },
        },
      },
    });
    doctors.push(doctor);
  }

  // ─── PATIENTS ─────────────────────────────────────────────────────────────
  const patientData = [
    {
      fullName: 'Uwase Aline',
      email: 'uwase.aline@gmail.com',
      phone: '+250788100001',
      district: 'Kigali',
      dateOfBirth: new Date('1995-03-15'),
      gender: 'Female',
      allergies: 'Penicillin',
      chronicConditions: 'Asthma',
      notes: 'Patient manages asthma with inhaler. Avoid penicillin-based antibiotics.',
    },
    {
      fullName: 'Mugisha Eric',
      email: 'mugisha.eric@gmail.com',
      phone: '+250788100002',
      district: 'Musanze',
      dateOfBirth: new Date('1988-07-22'),
      gender: 'Male',
      allergies: null,
      chronicConditions: 'Hypertension',
      notes: 'On antihypertensive medication. Regular BP monitoring required.',
    },
    {
      fullName: 'Iradukunda Claudine',
      email: 'iradukunda.claudine@gmail.com',
      phone: '+250788100003',
      district: 'Huye',
      dateOfBirth: new Date('2000-11-08'),
      gender: 'Female',
      allergies: null,
      chronicConditions: null,
      notes: 'First-time patient. Routine checkup.',
    },
    {
      fullName: 'Niyomugabo Celestin',
      email: 'niyomugabo.celestin@gmail.com',
      phone: '+250788100004',
      district: 'Rubavu',
      dateOfBirth: new Date('1975-01-30'),
      gender: 'Male',
      allergies: 'Sulfonamides',
      chronicConditions: 'Type 2 Diabetes',
      notes: 'Insulin-dependent diabetic. Requires careful medication management.',
    },
    {
      fullName: 'Mukeshimana Vestine',
      email: 'mukeshimana.vestine@gmail.com',
      phone: '+250788100005',
      district: 'Nyagatare',
      dateOfBirth: new Date('1992-05-17'),
      gender: 'Female',
      allergies: null,
      chronicConditions: 'Malaria (recurrent)',
      notes: 'Lives in malaria-endemic area. Prophylaxis recommended during rainy season.',
    },
    {
      fullName: 'Habimana Jean',
      email: 'habimana.jean@gmail.com',
      phone: '+250788100006',
      district: 'Muhanga',
      dateOfBirth: new Date('1983-09-05'),
      gender: 'Male',
      allergies: null,
      chronicConditions: null,
      notes: 'Routine health checkups.',
    },
  ];

  const patients = [];
  for (const p of patientData) {
    const patient = await prisma.user.create({
      data: {
        fullName: p.fullName,
        email: p.email,
        passwordHash: password,
        role: 'patient',
        phone: p.phone,
        district: p.district,
        isActive: true,
        patientProfile: {
          create: {
            dateOfBirth: p.dateOfBirth,
            gender: p.gender,
            allergies: p.allergies,
            chronicConditions: p.chronicConditions,
            notes: p.notes,
          },
        },
      },
    });
    patients.push(patient);
  }

  // ─── APPOINTMENTS ─────────────────────────────────────────────────────────
  const appointmentData = [
    {
      patient: patients[0],
      doctor: doctors[0],
      date: new Date('2025-08-15'),
      time: '09:00',
      reason: 'Routine checkup and asthma medication review',
      status: 'completed' as const,
    },
    {
      patient: patients[1],
      doctor: doctors[0],
      date: new Date('2025-08-20'),
      time: '10:30',
      reason: 'Blood pressure monitoring and medication adjustment',
      status: 'confirmed' as const,
    },
    {
      patient: patients[2],
      doctor: doctors[2],
      date: new Date('2025-08-25'),
      time: '14:00',
      reason: 'First consultation - general health assessment',
      status: 'pending' as const,
    },
    {
      patient: patients[3],
      doctor: doctors[0],
      date: new Date('2025-09-01'),
      time: '08:30',
      reason: 'Diabetes follow-up and insulin dosage review',
      status: 'confirmed' as const,
    },
    {
      patient: patients[4],
      doctor: doctors[3],
      date: new Date('2025-09-05'),
      time: '11:00',
      reason: 'Malaria prevention consultation and prophylaxis',
      status: 'pending' as const,
    },
    {
      patient: patients[0],
      doctor: doctors[2],
      date: new Date('2025-09-10'),
      time: '15:30',
      reason: 'Respiratory specialist referral follow-up',
      status: 'pending' as const,
    },
    {
      patient: patients[5],
      doctor: doctors[4],
      date: new Date('2025-09-12'),
      time: '09:00',
      reason: 'Surgical consultation for appendix pain',
      status: 'cancelled' as const,
    },
  ];

  const appointments = [];
  for (const a of appointmentData) {
    const appointment = await prisma.appointment.create({
      data: {
        patientId: a.patient.id,
        doctorId: a.doctor.id,
        appointmentDate: a.date,
        appointmentTime: a.time,
        reason: a.reason,
        status: a.status,
      },
    });
    appointments.push(appointment);
  }

  // ─── CONSULTATIONS ────────────────────────────────────────────────────────
  // For completed appointment
  await prisma.consultation.create({
    data: {
      appointmentId: appointments[0].id,
      notes:
        'Patient presents with well-controlled asthma. Ventolin inhaler usage reduced to 2x/week. Advised to continue current medication (Seretide 250 mcg). Next review in 3 months. Avoid smoke and dust exposure.',
      status: 'completed',
      startedAt: new Date('2025-08-15T09:00:00Z'),
      endedAt: new Date('2025-08-15T09:30:00Z'),
    },
  });

  // For confirmed appointment (in_progress)
  await prisma.consultation.create({
    data: {
      appointmentId: appointments[1].id,
      notes: 'Blood pressure reading: 145/90 mmHg. Slightly elevated. Adjusting Amlodipine dosage from 5mg to 10mg. Lifestyle advice given: reduce salt intake, increase physical activity.',
      status: 'in_progress',
      startedAt: new Date('2025-08-20T10:30:00Z'),
    },
  });

  // ─── HEALTH INFO ──────────────────────────────────────────────────────────
  const healthInfoData = [
    {
      title: 'Malaria Prevention in Rwanda: What You Need to Know',
      content: `Malaria remains one of the leading causes of illness in Rwanda, particularly in low-altitude areas. Here are essential prevention tips:

**Use Insecticide-Treated Nets (ITNs)**
Sleep under a mosquito net every night, especially between dusk and dawn when mosquitoes are most active.

**Indoor Residual Spraying (IRS)**
Rwanda's national malaria program offers free indoor spraying. Contact your local health center for scheduling.

**Antimalarial Medication**
If traveling to high-risk areas, consult a doctor about prophylactic medication such as Coartem or Fansidar.

**Symptoms to Watch For**
- Fever and chills
- Headache
- Muscle aches
- Nausea and vomiting

Seek medical attention immediately if you experience these symptoms after mosquito exposure.

**Community Action**
Eliminate standing water around your home where mosquitoes breed. Report stagnant water to local authorities.`,
      category: 'Malaria Prevention',
    },
    {
      title: 'Maternal Health: Prenatal Care Guidelines for Rwandan Mothers',
      content: `Rwanda has made remarkable progress in reducing maternal mortality. Here is what every expectant mother should know:

**Antenatal Visits**
The WHO recommends at least 8 antenatal care (ANC) visits during pregnancy. Rwanda's health centers offer free ANC services.

**Key Screenings**
- HIV testing (mandatory)
- Blood pressure monitoring
- Iron-deficiency anemia testing
- Malaria screening
- Ultrasound at 20 weeks

**Nutrition During Pregnancy**
- Take iron and folic acid supplements
- Eat diverse foods including legumes, vegetables, and fruits
- Avoid alcohol and tobacco

**Warning Signs**
Seek emergency care immediately for:
- Heavy vaginal bleeding
- Severe headaches or vision changes
- Swelling of face, hands, or feet
- Reduced fetal movement

**Delivery**
Always give birth in a health facility. Rwanda offers free delivery services at all public health centers.`,
      category: 'Maternal Health',
    },
    {
      title: 'Managing Hypertension: A Guide for Rwandan Patients',
      content: `Hypertension (high blood pressure) is increasingly common in Rwanda, affecting an estimated 20% of adults. 

**What is Hypertension?**
Blood pressure consistently above 140/90 mmHg is considered hypertensive. It is often called the "silent killer" because it has no obvious symptoms.

**Lifestyle Modifications**
- **Reduce salt intake**: Limit to less than 5g per day
- **Exercise regularly**: 30 minutes of moderate activity, 5 days per week
- **Maintain healthy weight**: Aim for BMI between 18.5–24.9
- **Stop smoking**: Smoking dramatically increases cardiovascular risk
- **Limit alcohol**: No more than 1–2 drinks per day

**Medication Compliance**
Never stop antihypertensive medication without consulting your doctor, even if you feel well.

**Regular Monitoring**
Check your blood pressure at your local health post monthly. Home monitors are available at pharmacies.

**Complications of Untreated Hypertension**
- Stroke
- Heart failure  
- Kidney disease
- Vision loss`,
      category: 'Chronic Disease Management',
    },
    {
      title: 'Children\'s Health: Vaccination Schedule in Rwanda',
      content: `Rwanda has one of the highest vaccination coverage rates in Africa. Ensure your child receives all scheduled vaccines.

**EPI (Expanded Programme on Immunization) Schedule**

| Age | Vaccines |
|-----|---------|
| Birth | BCG, Polio 0 |
| 6 weeks | Penta 1, Pneumo 1, Rota 1, Polio 1 |
| 10 weeks | Penta 2, Pneumo 2, Rota 2, Polio 2 |
| 14 weeks | Penta 3, Pneumo 3, Polio 3, IPV |
| 9 months | Measles-Rubella 1, Yellow Fever |
| 15 months | Measles-Rubella 2 |
| 12–23 months | Malaria vaccine (RTSS) |

**Where to Vaccinate**
All vaccines are free at public health centers and community health posts.

**Side Effects**
Mild fever and soreness at injection site are normal. Contact a health worker if fever persists beyond 48 hours.

**Importance**
Unvaccinated children are at risk of measles, polio, whooping cough, and other preventable diseases.`,
      category: 'Pediatric Health',
    },
    {
      title: 'HIV/AIDS Awareness and Prevention in Rwanda',
      content: `Rwanda has made exceptional progress in HIV/AIDS prevention and treatment. The country has one of the highest antiretroviral therapy (ART) coverage rates in sub-Saharan Africa.

**Know Your Status**
Free HIV testing is available at all health centers. Testing is confidential and voluntary.

**Prevention Methods**
- Use condoms consistently and correctly
- Engage in mutually monogamous relationships
- Pre-Exposure Prophylaxis (PrEP) is available for high-risk individuals
- Mother-to-child transmission can be prevented with proper ANC and ART

**Treatment**
People living with HIV who start ART early can live long, healthy lives. Rwanda provides free ART to all who need it.

**Stigma**
HIV/AIDS is a medical condition, not a moral failure. Help fight stigma by educating your community.

**Key Contact**
Visit your nearest health center for free testing, counseling, and treatment services.`,
      category: 'Infectious Disease',
    },
  ];

  for (const h of healthInfoData) {
    await prisma.healthInfo.create({
      data: {
        title: h.title,
        content: h.content,
        category: h.category,
        authorId: admin.id,
      },
    });
  }

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────
  const notificationsData = [
    {
      userId: patients[0].id,
      message: `Your appointment with Dr. Kagame Jean-Paul on Aug 15 at 09:00 has been completed. Your consultation notes are now available.`,
      type: 'appointment_completed',
      isRead: true,
    },
    {
      userId: patients[1].id,
      message: `Your appointment with Dr. Kagame Jean-Paul on Aug 20 at 10:30 has been confirmed. Please be available on time.`,
      type: 'appointment_confirmed',
      isRead: false,
    },
    {
      userId: doctors[0].id,
      message: `New appointment request from Mugisha Eric for Aug 20 at 10:30. Reason: Blood pressure monitoring.`,
      type: 'appointment_booked',
      isRead: true,
    },
    {
      userId: patients[2].id,
      message: `Your appointment with Dr. Habimana Patrick on Aug 25 at 14:00 is pending confirmation. You will be notified once confirmed.`,
      type: 'appointment_booked',
      isRead: false,
    },
    {
      userId: patients[3].id,
      message: `Appointment reminder: You have an appointment with Dr. Kagame Jean-Paul on Sep 1 at 08:30.`,
      type: 'reminder',
      isRead: false,
    },
    {
      userId: patients[4].id,
      message: `Your appointment request with Dr. Uwizeyimana Grace for Sep 5 is awaiting confirmation.`,
      type: 'appointment_booked',
      isRead: false,
    },
    {
      userId: patients[5].id,
      message: `Your appointment with Dr. Nshimiyimana Théodore on Sep 12 has been cancelled. Please rebook at your convenience.`,
      type: 'appointment_cancelled',
      isRead: false,
    },
    {
      userId: doctors[0].id,
      message: `Appointment reminder: You have 2 confirmed appointments tomorrow. Please review your schedule.`,
      type: 'reminder',
      isRead: false,
    },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
  }

  // ─── PRINT CREDENTIALS ────────────────────────────────────────────────────
  console.log('\nDatabase seeded successfully!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                   SEEDED LOGIN CREDENTIALS                ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\nALL ACCOUNTS USE PASSWORD: Password123!\n');

  console.log('ADMIN:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Name:  ${admin.fullName}`);

  console.log('\nDOCTORS:');
  doctors.forEach((d) => {
    console.log(`   Email: ${d.email}`);
    console.log(`   Name:  ${d.fullName}\n`);
  });

  console.log('PATIENTS:');
  patients.forEach((p) => {
    console.log(`   Email: ${p.email}`);
    console.log(`   Name:  ${p.fullName}\n`);
  });

  console.log('═══════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
