import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";
import { UNIVERSITY_OF_THE_ASSUMPTION_LOCATION } from "../lib/schoolLocations";

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting KUMUSTA high-density database seed...");

  // 1. Clear existing alerts, submissions, courses, and schools
  await prisma.alert.deleteMany();
  await prisma.classroomSubmission.deleteMany();
  await prisma.classroomCourse.deleteMany();
  await prisma.school.deleteMany();

  console.log("🧹 Cleared existing records in Alert, ClassroomSubmission, ClassroomCourse, and School.");

  // 2. Insert City of San Fernando Academic Institutions (15 schools)
  const schoolsData = [
    { name: "Pampanga High School", latitude: 15.0298, longitude: 120.6896 },
    { name: "University of the Assumption", ...UNIVERSITY_OF_THE_ASSUMPTION_LOCATION },
    { name: "St. Scholastica's Academy, San Fernando", latitude: 15.0539, longitude: 120.6636 },
    { name: "Our Lady of Fatima University – Pampanga Campus", latitude: 15.0561, longitude: 120.6433 },
    { name: "City College of San Fernando, Pampanga", latitude: 15.0290, longitude: 120.6780 },
    { name: "St. Nicolas College of Business and Technology", latitude: 15.0392, longitude: 120.6819 },
    { name: "St. Francis Academy of Pampanga", latitude: 15.0835, longitude: 120.6626 },
    { name: "Mother of Good Counsel Seminary", latitude: 15.0578, longitude: 120.6549 },
    { name: "Sindalan National High School", latitude: 15.0683, longitude: 120.6712 },
    { name: "City of San Fernando West Integrated High School", latitude: 15.0395, longitude: 120.7001 },
    { name: "San Agustin Integrated School", latitude: 15.0203, longitude: 120.6738 },
    { name: "Dolores Integrated School", latitude: 15.0369, longitude: 120.6833 },
    { name: "San Nicolas Integrated School", latitude: 15.0280, longitude: 120.6934 },
    { name: "Santa Lucia Integrated School", latitude: 15.0117, longitude: 120.6947 },
    { name: "Northville 14 Elementary School", latitude: 15.0959, longitude: 120.6486 },
  ];

  const createdSchools: Record<string, any> = {};
  for (const s of schoolsData) {
    const schoolRecord = await prisma.school.create({
      data: {
        name: s.name,
        division: "City of San Fernando",
        latitude: s.latitude,
        longitude: s.longitude,
      },
    });
    createdSchools[s.name] = schoolRecord;
  }

  const pampangaHigh = createdSchools["Pampanga High School"];
  const assumptionUniv = createdSchools["University of the Assumption"];
  const fatimaUniv = createdSchools["Our Lady of Fatima University – Pampanga Campus"];
  const scholasticaAcad = createdSchools["St. Scholastica's Academy, San Fernando"];
  const cityCollege = createdSchools["City College of San Fernando, Pampanga"];
  const sindalanHigh = createdSchools["Sindalan National High School"];
  const westHigh = createdSchools["City of San Fernando West Integrated High School"];
  const doloresSchool = createdSchools["Dolores Integrated School"];
  const stNicolas = createdSchools["St. Nicolas College of Business and Technology"];
  const sanAgustin = createdSchools["San Agustin Integrated School"];

  console.log(`🏫 Seeded ${schoolsData.length} City of San Fernando academic institutions.`);

  // 3. Seed Google Classroom Courses & Submissions for Demo Student (Juan Dela Cruz)
  const mathCourse = await prisma.classroomCourse.create({
    data: {
      courseId: "course-genmath-101",
      name: "General Mathematics",
      section: "Grade 11 - STEM A",
      submissions: {
        create: [
          {
            studentId: "demo-student-juan",
            title: "Quiz 1: Functions & Rational Equations",
            assignedDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
            grade: 38.0,
            maxPoints: 50.0,
          },
          {
            studentId: "demo-student-juan",
            title: "Seatwork 4: Inverse Functions & Graphs",
            assignedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            grade: 19.0,
            maxPoints: 50.0, // Significant drop (<50%)
          },
          {
            studentId: "demo-student-juan",
            title: "Midterm Examination: Exponential Equations",
            assignedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            grade: 14.0,
            maxPoints: 50.0, // Consecutive drop (<50%)
          },
        ],
      },
    },
  });

  const chemCourse = await prisma.classroomCourse.create({
    data: {
      courseId: "course-genchem-201",
      name: "General Chemistry 1",
      section: "Grade 11 - STEM A",
      submissions: {
        create: [
          {
            studentId: "demo-student-juan",
            title: "Problem Set 2: Stoichiometry & Molar Mass",
            assignedDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
            grade: 22.0,
            maxPoints: 50.0,
          },
          {
            studentId: "demo-student-juan",
            title: "Lab Report 3: Gas Laws & Thermodynamics",
            assignedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            grade: 20.0,
            maxPoints: 50.0, // Consecutive drop
          },
        ],
      },
    },
  });

  const oralCommCourse = await prisma.classroomCourse.create({
    data: {
      courseId: "course-oralcomm-301",
      name: "Oral Communication",
      section: "Grade 11 - STEM A",
      submissions: {
        create: [
          {
            studentId: "demo-student-juan",
            title: "Speech Activity: Persuasive Public Speaking",
            assignedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            dueDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            grade: 47.0,
            maxPoints: 50.0, // Consistent high mark
          },
        ],
      },
    },
  });

  console.log("📚 Seeded Google Classroom courses and submissions with realistic academic drop patterns.");

  // 4. Seed High-Density Crisis & Academic Distress Incidents (strictly non-clinical)
  const mockAlerts = [
    // University of the Assumption Cluster (Primary Monitored Hotspot)
    {
      schoolId: assumptionUniv.id,
      sessionId: "sess-ua-001",
      severity: "CRITICAL",
      classification: "SUICIDE_RISK",
      flaggedText: "Hindi ko na talaga kaya sir... pagod na pagod na ako sa lahat. Parang mas tahimik nung wala na ako.",
      counselorSummary: "Student expressing deep situational exhaustion and feelings of hopelessness regarding family isolation and heavy expectations.",
      doSay: [
        "Narito ako para makinig sa iyo nang buo, hindi ka nag-iisa sa nararamdaman mo ngayon.",
        "Salamat sa tiwala mo na ibahagi ito. Ligtas ka dito, pag-usapan natin nang dahan-dahan.",
        "Your feelings matter to us, and we will take this step-by-step together."
      ],
      dontSay: [
        "Huwag kang mag-isip ng ganyan, isipin mo sakripisyo ng pamilya mo.",
        "Kulang ka lang sa dasal o tulog.",
        "Napakabata mo pa para mamroblema ng ganyan."
      ],
      isAnonymous: false,
      status: "OPEN",
    },
    {
      schoolId: assumptionUniv.id,
      sessionId: "sess-ua-002",
      severity: "CRITICAL",
      classification: "SUICIDE_RISK",
      flaggedText: "E ku na agyu ing bie ku, masanting pa nung mamate na ku ngeni para mawala na ing problemang darala ku.",
      counselorSummary: "Critical distress expression in Kapampangan; student feels like a burden to family and expresses thoughts of ending life.",
      doSay: [
        "Kaluguran daka at arapan tala reng pagsubuk a reni. E ka mag-isa, andito kami para kekau.",
        "Importante ing bie mu. Pag-usapan taya ini king tahimik at ligtas a lugal."
      ],
      dontSay: [
        "E ka mag-inarte, dakal pa mas grabe problema kesa keka.",
        "Ali ka magsalita king makanyan."
      ],
      isAnonymous: false,
      status: "OPEN",
    },
    {
      schoolId: assumptionUniv.id,
      sessionId: "sess-ua-003",
      severity: "CRITICAL",
      classification: "SELF_HARM",
      flaggedText: "Nandito ako sa banyo ngayon, may hawak akong blade. Hindi ko na alam ang gagawin ko.",
      counselorSummary: "Immediate physical safety risk: student is currently holding a sharp object in the restroom.",
      doSay: [
        "Please stay where you are, papunta na ako dyan para samahan ka. Ligtas ka sa akin.",
        "Huminga ka nang dahan-dahan kasabay ko. Ibaba mo muna ang hawak mo para sa sarili mo."
      ],
      dontSay: [
        "Wag mong ituloy yan kundi ipapatawag ko magulang mo agad!",
        "Ano ba yang pinaggagawa mo sa buhay mo?"
      ],
      isAnonymous: false,
      status: "OPEN",
    },
    {
      schoolId: assumptionUniv.id,
      sessionId: "sess-ua-004",
      severity: "HIGH",
      classification: "ACADEMIC_DISTRESS",
      flaggedText: "Consecutive score drop in General Mathematics (Quiz 1: 38/50, Seatwork 4: 19/50, Midterm Exam: 14/50).",
      counselorSummary: "Proactive Classroom Sentinel: Student experienced sudden consecutive failing marks on recent Gen Math exams after previously stable performance.",
      doSay: [
        "Napansin ko na medyo sunod-sunod ang mabibigat na requirements sa Gen Math nitong mga nakaraang linggo. Kumusta ka?",
        "Walang pressure dito, gusto ko lang kamustahin kung kamusta ang tulog at pag-aaral mo nitong mga araw.",
        "Puwede nating pag-usapan ang study schedule mo o tulungan kang lumapit sa subject teacher."
      ],
      dontSay: [
        "Bakit bumagsak ang grades mo? Tamad ka ba mag-review?",
        "Dapat nag-aaral ka imbes na nagre-reklamo.",
        "Sayang ang pinapaaral sa iyo kung ganyan lang kukunin mong score."
      ],
      isAnonymous: false,
      status: "OPEN",
    },
    {
      schoolId: assumptionUniv.id,
      sessionId: "sess-ua-005",
      severity: "HIGH",
      classification: "BULLYING",
      flaggedText: "Araw-araw nila akong pinagkakaisahan sa group chat at classroom. Takot na akong pumasok bukas.",
      counselorSummary: "Student reports persistent group harassment and social exclusion by classmates, leading to fear of attending classes.",
      doSay: [
        "Hindi mo kasalanan ang ginagawa nila sa iyo. Karapatan mong maging ligtas sa loob ng paaralan.",
        "Protektahan natin ang kaligtasan mo. Gagawan natin ito ng maayos at kumpidensyal na aksyon."
      ],
      dontSay: [
        "Baka naman kasi pinatulan mo rin sila kaya ka ginaganyan?",
        "Hayaan mo na lang sila, mawawala din yan pag nasanay ka."
      ],
      isAnonymous: false,
      status: "OPEN",
    },
    {
      schoolId: assumptionUniv.id,
      sessionId: "sess-ua-006",
      severity: "MEDIUM",
      classification: "CRISIS",
      flaggedText: "Nalulunod na po ako sa research at thesis namin, hindi na po ako nakakatulog ng tatlong araw.",
      counselorSummary: "Student experiencing overwhelming workload stress and severe sleep disruption during group research deadlines.",
      doSay: [
        "Huminga muna tayo nang malalim. Ang kalusugan at pahinga mo ang pinakamahalaga sa lahat.",
        "Isa-isahin natin ang mga gawain para hindi ka mabigla. Tutulungan kitang gumawa ng time-blocking."
      ],
      dontSay: [
        "Lahat naman dumadaan dyan, magtiis ka.",
        "Time management lang yan, wag kang magreklamo."
      ],
      isAnonymous: true,
      status: "OPEN",
    },
    {
      schoolId: assumptionUniv.id,
      sessionId: "sess-ua-007",
      severity: "LOW",
      classification: "CRISIS",
      flaggedText: "Gusto ko lang po sana may makausap tungkol sa nararamdaman kong lungkot nitong mga nakaraang linggo.",
      counselorSummary: "Student proactively requested a supportive counseling dialogue regarding persistent loneliness.",
      doSay: [
        "Nandito ang guidance office para maging ligtas mong espasyo anumang oras.",
        "Ikinagagalak kong lumapit ka para mag-usap tayo."
      ],
      dontSay: [
        "Wala naman siguro yan, ngumiti ka lang."
      ],
      isAnonymous: false,
      status: "RESOLVED",
    },

    // Pampanga High School Cluster (Stable Campus Telemetry)
    {
      schoolId: pampangaHigh.id,
      sessionId: "sess-pamp-001",
      severity: "LOW",
      classification: "CRISIS",
      flaggedText: "Routine guidance consultation scheduled regarding college entrance examination preparation.",
      counselorSummary: "Student requested informational guidance counseling for upcoming career tracking and college admissions.",
      doSay: [
        "Malugod kitang tutulungan sa iyong mga pagpipiliang kurso at pagsasanay.",
        "Maganda ang iyong maagang paghahanda para sa kolehiyo."
      ],
      dontSay: [
        "Masyado pang maaga para mag-alala dyan."
      ],
      isAnonymous: false,
      status: "RESOLVED",
    },

    // Our Lady of Fatima University Cluster
    {
      schoolId: fatimaUniv.id,
      sessionId: "sess-fatima-001",
      severity: "HIGH",
      classification: "ACADEMIC_DISTRESS",
      flaggedText: "Consecutive score drop in General Chemistry 1 (Problem Set: 22/50, Lab Report: 20/50).",
      counselorSummary: "Academic Sentinel Alert: Consecutive failing marks on laboratory experiments and problem sets.",
      doSay: [
        "Kumusta ang chemistry subject mo? Napansin ko na medyo mahirap ang recent lab exercises.",
        "Gusto mo bang pag-usapan kung aling mga concepts ang medyo nakakalito para makahanap tayo ng peer tutor?"
      ],
      dontSay: [
        "Bakit ganyan kababa ang chem mo?",
        "Wag ka mag-dahilan kung bakit ka bagsak."
      ],
      isAnonymous: false,
      status: "OPEN",
    },

    // St. Scholastica's Academy Cluster
    {
      schoolId: scholasticaAcad.id,
      sessionId: "sess-schol-001",
      severity: "HIGH",
      classification: "CRISIS",
      flaggedText: "Pinalayas po ako sa bahay kagabi, wala po akong matuluyan at takot na takot po ako.",
      counselorSummary: "Immediate shelter and domestic crisis: student displaced from home without safe accommodation.",
      doSay: [
        "Ang pinakamahalaga ngayon ay ang iyong pisikal na kaligtasan. Aayusin natin ang pansamantalang masisilungan mo.",
        "Kasama mo kami at makikipag-ugnayan tayo sa mga tamang kawani upang matulungan ka."
      ],
      dontSay: [
        "Umuwi ka at humingi ng tawad sa mga magulang mo.",
        "Bakit ka naman pinalayas? May kasalanan ka siguro."
      ],
      isAnonymous: false,
      status: "OPEN",
    },

    // City College of San Fernando Cluster
    {
      schoolId: cityCollege.id,
      sessionId: "sess-ccsf-001",
      severity: "MEDIUM",
      classification: "BULLYING",
      flaggedText: "Sinasabihan nila akong malas at pinalalabas nilang magnanakaw ako sa classroom.",
      counselorSummary: "False accusations and peer ostracization within the classroom environment causing social distress.",
      doSay: [
        "Mariin nating ititigil ang paninirang-puri na ito. Kakampi mo ang counseling office.",
        "Makikipag-ugnayan tayo sa classroom adviser para matiyak ang iyong proteksyon."
      ],
      dontSay: [
        "Baka naman kasi may ginawa ka kaya nagkaganun?",
        "Huwag mo na lang silang pansinin."
      ],
      isAnonymous: true,
      status: "OPEN",
    },

    // Sindalan National High School Cluster
    {
      schoolId: sindalanHigh.id,
      sessionId: "sess-sindalan-001",
      severity: "HIGH",
      classification: "SUICIDE_RISK",
      flaggedText: "Wala na pong saysay ang lahat. Pakiramdam ko pabigat lang ako sa nanay kong nag-iisa.",
      counselorSummary: "Student expressing deep feelings of being an emotional and financial burden to their solo parent.",
      doSay: [
        "Napakalaki ng halaga mo, at nakikita ko kung gaano ka nagmamalasakit sa nanay mo.",
        "Pag-usapan natin kung paano ka natin mabibigyan ng lakas at katuwang sa mga nararanasan mo."
      ],
      dontSay: [
        "Isipin mo nagsasakripisyo nanay mo tapos ganyan ka mag-isip.",
        "Wala namang madali sa buhay, magtiis ka."
      ],
      isAnonymous: false,
      status: "OPEN",
    },

    // City of San Fernando West Integrated High School Cluster
    {
      schoolId: westHigh.id,
      sessionId: "sess-west-001",
      severity: "MEDIUM",
      classification: "BULLYING",
      flaggedText: "Pinagtatawanan po nila ang suot kong lumang sapatos tuwing flag ceremony.",
      counselorSummary: "Socio-economic bullying and teasing during morning school assemblies affecting self-esteem.",
      doSay: [
        "Walang sinuman ang may karapatang maliitin ka dahil sa iyong gamit o kalagayan.",
        "Maaasahan mo ang aking buong proteksyon at suporta dito sa paaralan."
      ],
      dontSay: [
        "Huwag ka kasing masyadong maramdamin sa mga biro nila."
      ],
      isAnonymous: true,
      status: "OPEN",
    },

    // Dolores Integrated School Cluster
    {
      schoolId: doloresSchool.id,
      sessionId: "sess-dolores-001",
      severity: "HIGH",
      classification: "CRISIS",
      flaggedText: "Hindi po ako makapasok dahil binabantaan ako ng grupo sa labas ng gate.",
      counselorSummary: "External neighborhood intimidation outside school premises threatening student safety during transit.",
      doSay: [
        "Salamat sa pagsasabi sa amin. Makikipag-ugnayan kami sa barangay at school security para sa iyong safe transit.",
        "Huwag kang mag-alala, gagawin namin ang lahat para maging ligtas ka papunta at pauwi."
      ],
      dontSay: [
        "Baka may atraso ka sa kanila?",
        "Wag ka na lang lumabas mag-isa."
      ],
      isAnonymous: false,
      status: "OPEN",
    },

    // St. Nicolas College of Business and Technology Cluster
    {
      schoolId: stNicolas.id,
      sessionId: "sess-snc-001",
      severity: "MEDIUM",
      classification: "ACADEMIC_DISTRESS",
      flaggedText: "Hindi po ako makahabol sa accounting case studies namin, sobrang napag-iiwanan na ako.",
      counselorSummary: "Academic pacing and performance distress in business accounting subjects.",
      doSay: [
        "Normal na maramdaman ang pressure sa major subjects. Nandito kami para suportahan ka.",
        "Puwede tayong makipag-coordinate para sa review modules o study group."
      ],
      dontSay: [
        "Bakit kasi yan ang kinuha mong kurso kung nahihirapan ka?",
        "Mag-aral ka na lang nang mas mabuti."
      ],
      isAnonymous: false,
      status: "OPEN",
    },

    // San Agustin Integrated School Cluster
    {
      schoolId: sanAgustin.id,
      sessionId: "sess-agustin-001",
      severity: "LOW",
      classification: "CRISIS",
      flaggedText: "Nahihirapan po ako makasabay sa Math lessons, nahihiya po akong magtanong sa guro.",
      counselorSummary: "Academic learning difficulty and hesitation to ask clarification questions during class.",
      doSay: [
        "Napakagandang hakbang na sinabi mo ito. Puwede kitang tulungang kumausap o mag-set ng peer tutoring session.",
        "Normal lang na humingi ng tulong kapag hindi naiintindihan ang lesson."
      ],
      dontSay: [
        "Dapat kasi nakikinig ka nang maayos sa klase."
      ],
      isAnonymous: true,
      status: "RESOLVED",
    }
  ];

  for (const alertData of mockAlerts) {
    await prisma.alert.create({
      data: alertData,
    });
  }

  console.log(`✅ Successfully seeded ${mockAlerts.length} high-density crisis & academic distress alerts across City of San Fernando!`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
