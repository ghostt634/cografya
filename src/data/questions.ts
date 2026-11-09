export type Difficulty = "kolay" | "orta" | "zor";
export type Letter = "A" | "B" | "C" | "D" | "E";
export interface Question {
  id: number;
  unit: number;
  difficulty: Difficulty;
  question: string;
  options: [string, string, string, string, string];
  correctAnswer: Letter;
  explanation: string;
  points: number;
  hint?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export const questions: Question[] = [
  {
    id: 1,
    unit: 1,
    difficulty: "kolay",
    question:
      "Mekânsal bir sorunun coğrafi yaklaşımla incelenmesinde aşağıdakilerden hangisi temel öneme sahiptir?",
    options: [
      "Sorunun yalnızca tarihî gelişimi",
      "Sorunun konumu, dağılışı ve çevresiyle ilişkileri",
      "Araştırmacının kişisel düşünceleri",
      "Yalnızca ekonomik maliyetinin hesaplanması",
      "Sorunun yalnızca ortaya çıkış tarihinin belirlenmesi",
    ],
    correctAnswer: "B",
    explanation:
      "Coğrafya olayların nerede, neden ve nasıl ortaya çıktığını, dağılışını ve diğer mekânsal unsurlarla bağlantısını inceler.",
    points: 5,
    hint: "Coğrafyanın temel sorgulama ilkelerinden dağılış ve karşılıklı ilişki prensiplerini hatırla.",
  },
  {
    id: 2,
    unit: 1,
    difficulty: "kolay",
    question: "Aşağıdakilerden hangisi mekânsal bir soruna örnektir?",
    options: [
      "Bir edebî eserin türünün değişmesi",
      "Bir müzik türünün popülerleşmesi",
      "Kentleşme nedeniyle verimli tarım alanlarının daralması",
      "Bir kelimenin yazımının değiştirilmesi",
      "Bir matematik formülünün yeniden düzenlenmesi",
    ],
    correctAnswer: "C",
    explanation:
      "Tarım alanlarının yapılaşma nedeniyle azalması arazi kullanımına ilişkin mekânsal bir sorundur.",
    points: 5,
    hint: "Arazi kullanımı ve yüzeydeki değişimlerle ilgili fiziki bir mekana odaklan.",
  },
  {
    id: 3,
    unit: 1,
    difficulty: "orta",
    question:
      "Dağlarla çevrili bir şehirde kış aylarında sıcaklık terselmesi nedeniyle hava kirliliği artmaktadır. Bu sorunun incelenmesinde hangi iki coğrafya alt dalından öncelikle yararlanılır?",
    options: [
      "Klimatoloji ve jeomorfoloji",
      "Hidrografya ve siyasi coğrafya",
      "Biyocoğrafya ve nüfus coğrafyası",
      "Toprak coğrafyası ve turizm coğrafyası",
      "Tarım coğrafyası ve ulaşım coğrafyası",
    ],
    correctAnswer: "A",
    explanation:
      "Sıcaklık terselmesi atmosfer koşullarıyla, dağlık yapı ise yer şekilleriyle ilişkilidir.",
    points: 10,
    hint: "Atmosfer olaylarını inceleyen dal ile yer şekillerini inceleyen bilimi eşleştir.",
  },
  {
    id: 4,
    unit: 1,
    difficulty: "orta",
    question:
      "Bir ovada sanayi tesislerinin artmasıyla tarım arazileri daralmış, su kirliliği yükselmiş ve yerleşim alanları genişlemiştir. Bu sorunun çözümünde en uygun coğrafi yaklaşım hangisidir?",
    options: [
      "Yalnızca fabrika sayılarını incelemek",
      "Sadece geçmişte yetiştirilen ürünleri belirlemek",
      "Sanayi üretimini çevresel etkilerden bağımsız değerlendirmek",
      "Arazi kullanımı, su kaynakları, nüfus ve ekonomik faaliyetleri birlikte incelemek",
      "Yalnızca ovanın yükseltisini hesaplamak",
    ],
    correctAnswer: "D",
    explanation:
      "Coğrafyanın bütüncül yaklaşımı doğal ve beşerî unsurların karşılıklı etkilerini birlikte ele alır.",
    points: 10,
    hint: "Doğal ve beşeri tüm bileşenleri tek taraflı değil, sentezleyen yaklaşımı düşün.",
  },
  {
    id: 5,
    unit: 1,
    difficulty: "zor",
    question:
      "İki şehirde atmosfere salınan kirletici miktarının benzer olduğu belirlenmiştir. Ancak birinci şehirde hava kirliliği çok daha yüksektir. Bu farklılığı açıklamak için aşağıdaki hipotezlerden hangisi coğrafi açıdan en güçlüdür?",
    options: [
      "Şehirlerin kuruluş tarihlerinin farklı olması",
      "Birinci şehirde ticaret faaliyetlerinin daha eski olması",
      "Şehirlerde kullanılan mimari tarzların farklılaşması",
      "Şehirlerin idari statülerinin aynı olmaması",
      "Yer şekilleri, hâkim rüzgârlar ve sıcaklık terselmesi koşullarının farklı olması",
    ],
    correctAnswer: "E",
    explanation:
      "Kirleticilerin atmosferde birikmesi topoğrafya, hava hareketleri ve atmosferin düşey sıcaklık koşullarıyla yakından ilişkilidir.",
    points: 15,
    hint: "Şehrin çanak şeklinde olması ve hava sirkülasyonunu engelleyen yer şekillerini değerlendir.",
  },
  {
    id: 6,
    unit: 1,
    difficulty: "zor",
    question:
      "Bir bölgede yer altı su seviyesinin düşmesiyle obruk sayısı artmıştır. Yağışlı bir dönem sonrasında ise bazı alanlarda çökmeler hızlanmıştır. Bu durumdan aşağıdakilerden hangisine ulaşılabilir?",
    options: [
      "Obruk oluşumu yalnızca yağış miktarına bağlıdır",
      "Yer altı sularının azalması kayaçların tamamını sağlamlaştırır",
      "İnsan faaliyetleriyle zayıflayan zemin, doğal süreçlerle birlikte çökme riskini artırabilir",
      "Yağışlar yer altındaki tüm boşlukları ortadan kaldırır",
      "Obruk oluşumunda coğrafi koşulların etkisi bulunmaz",
    ],
    correctAnswer: "C",
    explanation:
      "Yer altı suyunun aşırı kullanımı ve doğal süreçler birlikte zeminin çökme riskini artırabilir.",
    points: 15,
    hint: "Aşırı yer altı suyu çekimi sonrası karstik boşlukların çökmesiyle oluşan çukurlukları hatırla.",
  },
  {
    id: 7,
    unit: 2,
    difficulty: "kolay",
    question:
      "Coğrafi Bilgi Sistemlerinde farklı verilerin katmanlar hâlinde gösterilmesinin temel amacı nedir?",
    options: [
      "Haritalardaki bütün bilgileri gizlemek",
      "Haritaların ölçeğini ortadan kaldırmak",
      "Yer şekillerini fiziksel olarak değiştirmek",
      "Konuma bağlı verileri karşılaştırmak ve analiz etmek",
      "Haritaları yalnızca dekoratif amaçla kullanmak",
    ],
    correctAnswer: "D",
    explanation:
      "CBS, farklı mekânsal verilerin katmanlar hâlinde birlikte analiz edilmesini sağlar.",
    points: 5,
    hint: "Farklı mekânsal katmanların üst üste bindirilmesi (çakıştırma) yöntemini düşün.",
  },
  {
    id: 8,
    unit: 2,
    difficulty: "kolay",
    question:
      "Uydu görüntülerinden yararlanılarak orman alanlarının yıllar içindeki değişiminin takip edilmesi hangi teknolojiyle doğrudan ilişkilidir?",
    options: [
      "Uzaktan algılama",
      "Ses kayıt teknolojisi",
      "Nüfus sayımı",
      "Kimyasal ayrıştırma",
      "Mekanik sondaj",
    ],
    correctAnswer: "A",
    explanation:
      "Uzaktan algılama ile yeryüzüne ilişkin bilgiler doğrudan temas olmadan elde edilebilir.",
    points: 5,
    hint: "Farklı zamanlara ait görüntülerin zamansal (temporal) karşılaştırmasını göz önüne al.",
  },
  {
    id: 9,
    unit: 2,
    difficulty: "orta",
    question:
      "Bir belediye yeni hastane kurulacak bölgeyi belirlemek için nüfus yoğunluğu, ulaşım ağları ve mevcut hastanelerin konumlarını CBS ortamında incelemektedir. Hangi bölgenin seçilmesi daha uygundur?",
    options: [
      "Yalnızca en yüksek rakımlı bölgenin",
      "Nüfus yoğunluğu yüksek, sağlık hizmetlerine erişimi yetersiz ve ulaşımı uygun bölgenin",
      "Mevcut hastanelerin en yoğun olduğu bölgenin",
      "Ulaşım bağlantısı bulunmayan bölgenin",
      "Yalnızca yüz ölçümü en geniş bölgenin",
    ],
    correctAnswer: "B",
    explanation:
      "CBS analizinde nüfusun ihtiyaçları ve mekânsal erişilebilirlik birlikte değerlendirilmelidir.",
    points: 10,
    hint: "Ulaşım ağlarına yakınlık ve nüfus yoğunluğunun çakıştırılması analizine odaklan.",
  },
  {
    id: 10,
    unit: 2,
    difficulty: "orta",
    question:
      "Görseldeki CBS analiz şeması incelendiğinde; hastaneler nokta, yollar çizgi ve mahalle sınırları poligon olarak gösterilmektedir. Bu veri yapıları hangi veri modeline örnektir?",
    options: ["Raster", "Analog", "Vektör", "Metinsel", "Zamansal"],
    correctAnswer: "C",
    explanation: "Nokta, çizgi ve poligon yapıları vektör veri modelinin temel geometrileridir.",
    points: 10,
    hint: "Mekansal veri modellerinde nokta, çizgi ve alan geometri türlerinin farklarını hatırla.",
    imageUrl: "/images/questions/cbs_katmanlar.svg",
    imageAlt: "CBS Vektör Veri Modeli Katmanları (Nokta, Çizgi, Poligon)",
  },
  {
    id: 11,
    unit: 2,
    difficulty: "zor",
    question:
      "Bir araştırmacı taşkın riski haritası oluştururken yağış, yükselti, eğim ve arazi örtüsü verilerini kullanmıştır. Ancak arazi örtüsü verileri 15 yıl öncesine aittir ve bölgede yoğun kentleşme yaşanmıştır. Bu durum haritayı nasıl etkileyebilir?",
    options: [
      "Haritanın bütün konum bilgilerini geçersiz kılar",
      "Yükselti ölçümlerini otomatik olarak değiştirir",
      "Taşkın riskinin mutlaka sıfır görünmesine neden olur",
      "Yağış verilerinin gerçekliğini ortadan kaldırır",
      "Güncel geçirimsiz yüzeyleri yansıtmadığı için risk tahminlerini hatalı hâle getirebilir",
    ],
    correctAnswer: "E",
    explanation:
      "Eski arazi örtüsü verileri güncel yapılaşmayı ve yüzey akışı koşullarını yansıtmayabilir.",
    points: 15,
    hint: "Arazinin eğim ve topoğrafyasını gösteren yükseklik modelinin önemini düşün.",
  },
  {
    id: 12,
    unit: 2,
    difficulty: "zor",
    question:
      "Aynı bölge için hazırlanan iki sel riski haritasından birincisinde yalnızca yükselti verisi, ikincisinde ise yükselti, eğim, toprak geçirgenliği, arazi örtüsü ve drenaj ağı kullanılmıştır. Hangisi daha doğru bir bilimsel değerlendirmedir?",
    options: [
      "Birinci harita her durumda daha güvenilirdir",
      "İkinci harita taşkınları tamamen engeller",
      "İki haritanın sonuçlarının aynı olması zorunludur",
      "İkinci harita daha fazla ilgili değişkeni değerlendirdiğinden genellikle daha kapsamlı bir risk modeli sunar",
      "Verilerin sayısı arttıkça haritalar mutlaka geçersiz olur",
    ],
    correctAnswer: "D",
    explanation:
      "Çok değişkenli mekânsal analiz, taşkın riskine etki eden farklı faktörleri birlikte değerlendirebilir.",
    points: 15,
    hint: "Kullanılan verilerin çözünürlük ve ölçek farkının sonuçları nasıl etkilediğini hatırla.",
  },
  {
    id: 13,
    unit: 3,
    difficulty: "kolay",
    question:
      "Görseldeki hidrojeolojik kesit incelendiğinde, yer altı su kaynaklarının (akiferlerin) beslenmesini doğrudan sağlayan ve toprağa su geçişini ifade eden süreç hangisidir?",
    options: [
      "Deniz suyunun buharlaşması",
      "Toprağın tamamen asfaltla kaplanması",
      "Yağış sularının toprağa sızması (İnfiltrasyon)",
      "Yer altı suyunun aşırı çekilmesi",
      "Bitki örtüsünün tamamen kaldırılması",
    ],
    correctAnswer: "C",
    explanation:
      "Yağış suyunun zemine sızması (infiltrasyon), uygun jeolojik koşullarda yer altı su kaynaklarını (akiferleri) besleyen temel süreçtir.",
    points: 5,
    hint: "Suyun yer altına sızmasını sağlayan atmosferik kökenli kaynağı ve şemadaki sızma okunu düşün.",
    imageUrl: "/images/questions/su_dongusu_akifer.svg",
    imageAlt: "Su Döngüsü, Sızma (İnfiltrasyon) ve Akifer Tabakaları Şeması",
  },
  {
    id: 14,
    unit: 3,
    difficulty: "kolay",
    question:
      "Bir akarsuyun yıl boyunca taşıdığı su miktarındaki değişim hangi kavramla ifade edilir?",
    options: [
      "Su bölümü çizgisi",
      "Akarsu rejimi",
      "Akarsu havzası",
      "Yatak eğimi",
      "Akarsu aşındırması",
    ],
    correctAnswer: "B",
    explanation: "Akarsu rejimi, akım miktarının yıl içindeki değişimini ifade eder.",
    points: 5,
    hint: "Akarsuyun yıl içindeki akım dalgalanmalarını ifade eden terimi hatırla.",
  },
  {
    id: 15,
    unit: 3,
    difficulty: "orta",
    question:
      "Kar erimeleriyle beslenen bir akarsuyun ilkbahar aylarında debisinin yükselmesinin temel nedeni nedir?",
    options: [
      "Deniz seviyesinin sabit kalması",
      "Akarsu yatağının derinleşmesi",
      "Yer kabuğunun kalınlaşması",
      "Sıcaklık artışıyla kar örtüsünün erimesi",
      "Akarsuyun yönünün değişmesi",
    ],
    correctAnswer: "D",
    explanation:
      "İlkbaharda sıcaklığın artması karların erimesine ve akarsuya katılan su miktarının yükselmesine neden olabilir.",
    points: 10,
    hint: "Sıcaklıkların artmasıyla karların en çok hangi dönemde eridiğini ve debiyi artırdığını düşün.",
  },
  {
    id: 16,
    unit: 3,
    difficulty: "orta",
    question:
      "Benzer miktarda yağış alan iki havzadan birinde geçirgen, diğerinde geçirimsiz kayaçlar yaygındır. Geçirgen kayaçların bulunduğu havzada hangi durumun görülmesi daha olasıdır?",
    options: [
      "Suyun yer altına sızmasının daha fazla olması",
      "Yağışın tamamının yüzey akışına geçmesi",
      "Yer altı sularının hiçbir şekilde beslenmemesi",
      "Buharlaşmanın tamamen durması",
      "Yağış miktarının zorunlu olarak artması",
    ],
    correctAnswer: "A",
    explanation: "Geçirgen kayaçlar suyun yer altına sızmasını kolaylaştırabilir.",
    points: 10,
    hint: "Yüzey örtüsünün ve ormanların suyun akışa geçmesini nasıl geciktirdiğini hatırla.",
  },
  {
    id: 17,
    unit: 3,
    difficulty: "zor",
    question:
      "Bir akarsu havzasında ormanlar kaldırılmış, geniş alanlar asfaltla kaplanmıştır. Bölgedeki yağış miktarında belirgin değişim olmamasına rağmen ani taşkınlar artmıştır. Bu değişimin temel açıklaması hangisidir?",
    options: [
      "Buharlaşmanın tamamen ortadan kalkması",
      "Akarsu havzasının büyümesi",
      "Akarsu yataklarının bütün kesimlerde derinleşmesi",
      "Toprak altındaki bütün suların yüzeye çıkması",
      "Sızmanın azalması ve yüzeysel akışın hızlanması",
    ],
    correctAnswer: "E",
    explanation:
      "Geçirimsiz yüzeyler yağmur suyunun zemine sızmasını azaltır ve ani yüzey akışını artırır.",
    points: 15,
    hint: "Bitki örtüsü kalktığında suyun yüzey akışına geçiş hızını ve taşkın sıklığını göz önüne al.",
  },
  {
    id: 18,
    unit: 3,
    difficulty: "zor",
    question:
      "Bir bölgede uzun süren kuraklık nedeniyle yer altı suyu çekimi artırılmış, bazı kaynakların debisi azalmış ve akarsuların kurak dönem akımları düşmüştür. Bu durum hangi hidrolojik ilişkiyi ortaya koyar?",
    options: [
      "Yer altı suyu ile akarsuların hiçbir bağlantısı yoktur",
      "Kuraklık akarsu rejimlerini düzenli hâle getirir",
      "Yer altı suyu rezervlerinin azalması, bu kaynaklardan beslenen yüzey sularını da etkileyebilir",
      "Su döngüsü kurak dönemlerde tamamen durur",
      "Yer altı suyu çekimi bütün kaynakların debisini artırır",
    ],
    correctAnswer: "C",
    explanation:
      "Yer altı ve yüzey suları hidrolojik açıdan bağlantılı olabilir; yer altı su seviyesindeki düşüş, kaynak akımlarını azaltabilir.",
    points: 15,
    hint: "Yer altı suyunun taban seviyesinin düşmesiyle akarsu ve göllerle olan hidrolojik bağlantıyı düşün.",
  },
  {
    id: 19,
    unit: 4,
    difficulty: "kolay",
    question:
      "Bir şehrin çevresindeki yerleşmelere sunduğu eğitim, sağlık ve ticaret hizmetlerinin ulaştığı coğrafi alan hangi kavramla açıklanır?",
    options: [
      "Akarsu havzası",
      "Fay hattı",
      "İklim bölgesi",
      "Yerleşmenin etki alanı",
      "Su bölümü çizgisi",
    ],
    correctAnswer: "D",
    explanation:
      "Etki alanı, yerleşmelerin sundukları hizmetler ve işlevler sayesinde çevreleriyle kurdukları bağlantıların ulaştığı alandır.",
    points: 5,
    hint: "Merkezi bir yerleşmenin etki alanını ve hinterlandını değerlendir.",
  },
  {
    id: 20,
    unit: 4,
    difficulty: "kolay",
    question:
      "Bir yerleşmenin ulaşım ve ticaret faaliyetleri açısından gelişmesini doğrudan kolaylaştıran özellik hangisidir?",
    options: [
      "Ulaşım ağlarının güçlü olması",
      "Yalnızca yıllık sıcaklık ortalamasının bilinmesi",
      "Yalnızca kayaç türünün belirlenmesi",
      "Sadece bulunduğu enlemin değişmemesi",
      "Yerleşmenin bütün bağlantı yollarının kapalı olması",
    ],
    correctAnswer: "A",
    explanation:
      "Ulaşım bağlantıları yerleşmeler arasındaki insan, mal ve hizmet hareketliliğini destekler.",
    points: 5,
    hint: "Ulaşım yollarının kesişim noktasında bulunan stratejik kavşak yerleşmelerini hatırla.",
  },
  {
    id: 21,
    unit: 4,
    difficulty: "orta",
    question:
      "Nüfusları birbirine yakın iki şehirden A'da üniversite hastaneleri, uluslararası havaalanı ve gelişmiş ticaret merkezleri; B'de ise yalnızca temel hizmetler bulunmaktadır. Buna göre hangi yorum daha uygundur?",
    options: [
      "İki şehrin etki alanı zorunlu olarak eşittir",
      "A şehrinin hizmet etki alanı daha geniş olabilir",
      "B şehri hiçbir ekonomik faaliyet yapamaz",
      "A şehrinin nüfusu kesinlikle daha azdır",
      "Şehirlerin etki alanını yalnızca yüz ölçümleri belirler",
    ],
    correctAnswer: "B",
    explanation:
      "Uzmanlaşmış hizmetler farklı yerleşmelerden insan çekerek bir şehrin etki alanını genişletebilir.",
    points: 10,
    hint: "Hizmet sektörü, eğitim ve uzmanlaşmış fonksiyonların çekim gücüne odaklan.",
  },
  {
    id: 22,
    unit: 4,
    difficulty: "orta",
    question:
      "Bir otoyolun açılmasıyla küçük bir yerleşmeden bölgesel merkeze ulaşım süresi 120 dakikadan 60 dakikaya düşmüştür. Bu gelişmenin hangi sonucu doğurması beklenir?",
    options: [
      "Yerleşmelerin mutlak konumlarının değişmesi",
      "Bölgesel merkezin bütün hizmetlerini kaybetmesi",
      "Yerleşmelerin yükseltilerinin azalması",
      "Yerleşmeler arasındaki ekonomik ilişkinin sona ermesi",
      "Hizmetlere erişimin kolaylaşması ve yerleşmeler arası etkileşimin artması",
    ],
    correctAnswer: "E",
    explanation:
      "Ulaşım süresinin azalması erişilebilirliği artırabilir ve yerleşmeler arasındaki işlevsel bağlantıları güçlendirebilir.",
    points: 10,
    hint: "Mekânsal erişilebilirliğin artmasıyla merkeze olan bağımlılığın ve göçün nasıl etkilendiğini düşün.",
  },
  {
    id: 23,
    unit: 4,
    difficulty: "zor",
    question:
      "Üç yerleşmenin sunduğu hizmetler şöyledir: X: İlkokul ve temel marketler. Y: Lise, devlet hastanesi ve bölgesel ticaret merkezi. Z: Uluslararası havaalanı, üniversite hastanesi ve uzmanlaşmış finans hizmetleri. Diğer koşulların benzer olduğu düşünülürse olası etki alanı sıralaması hangisidir?",
    options: ["X > Y > Z", "Y > X > Z", "Z > Y > X", "X = Y = Z", "Z > X > Y"],
    correctAnswer: "C",
    explanation:
      "Hizmetlerin çeşitliliği ve uzmanlaşma düzeyi arttıkça bir yerleşmenin çevresindeki çekim alanı genellikle genişler.",
    points: 15,
    hint: "Hizmet kademelenmesi (ilkokuldan üniversiteye) hiyerarşik etki kademesini belirler.",
  },
  {
    id: 24,
    unit: 4,
    difficulty: "zor",
    question:
      "Nüfusu yüksek olan bir ilçede açılan büyük alışveriş merkezi beklenen müşteri sayısına ulaşamamıştır. Yakın çevrede daha büyük ticaret merkezleri ve güçlü ulaşım bağlantıları bulunmaktadır. Bu durumu açıklayan en güçlü neden hangisidir?",
    options: [
      "İlçenin yüksek nüfuslu olması",
      "Ticari faaliyetlerin varlığı",
      "İlçede konutların bulunması",
      "Erişilebilirlik koşulları ve rakip merkezlerin bölgesel çekim gücü",
      "İlçenin bir idari sınır içinde yer alması",
    ],
    correctAnswer: "D",
    explanation:
      "Yerleşmelerin ticari etki alanını yalnızca nüfus değil, ulaşım koşulları ve diğer merkezlerle rekabet de belirler.",
    points: 15,
    hint: "Büyük ticaret merkezlerinin kırsal ve küçük yerleşmeler üzerindeki çekim alanını değerlendir.",
  },
  {
    id: 25,
    unit: 5,
    difficulty: "kolay",
    question: "Gıda güvencesi kavramı aşağıdakilerden hangisini ifade eder?",
    options: [
      "Yalnızca tarımsal ihracatın artmasını",
      "Herkesin yeterli, güvenilir ve besleyici gıdaya erişebilmesini",
      "Bütün ülkelerin aynı ürünü yetiştirmesini",
      "Tarım alanlarının tamamen sanayiye dönüştürülmesini",
      "Gıda fiyatlarının her koşulda aynı kalmasını",
    ],
    correctAnswer: "B",
    explanation:
      "Gıda güvencesi, insanların yeterli ve güvenilir gıdaya fiziksel ve ekonomik erişimini de kapsar.",
    points: 5,
    hint: "Gıdaya fiziksel ve ekonomik erişim ile besleyici gıdanın sürekliliğini düşün.",
  },
  {
    id: 26,
    unit: 5,
    difficulty: "kolay",
    question: "Aşağıdakilerden hangisi sürdürülebilir tarım uygulamalarından biridir?",
    options: [
      "Yer altı sularını sınırsız tüketmek",
      "Toprağın sürekli aynı ürünle yorulmasını sağlamak",
      "Bütün tarım alanlarını yapılaşmaya açmak",
      "Tarımda su kayıplarını artırmak",
      "Ürün rotasyonu ve verimli sulama yöntemlerini kullanmak",
    ],
    correctAnswer: "E",
    explanation:
      "Ürün rotasyonu ve verimli sulama, toprak ve su kaynaklarının korunmasına yardımcı olabilir.",
    points: 5,
    hint: "Toprağı ve su kaynaklarını tüketmeden gelecek nesillere aktaran çevre dostu yöntemleri hatırla.",
  },
  {
    id: 27,
    unit: 5,
    difficulty: "orta",
    question:
      "Haritada Türkiye'deki stratejik madenlerin dağılışı gösterilmiştir. Sanayileşmede elektrikli araç bataryaları ve yüksek teknoloji için kritik maden tedarikinde dışa bağımlılığı azaltmak isteyen bir ülke için hangi strateji en uygundur?",
    options: [
      "Maden ithalatında tek ülkeye bağımlılığı artırmak",
      "Geri dönüşüm faaliyetlerini sonlandırmak",
      "Tedarik kaynaklarını çeşitlendirmek ve geri kazanım kapasitesini artırmak",
      "Kritik maden stoklarını tamamen ortadan kaldırmak",
      "Yerli alternatif teknolojileri araştırmayı bırakmak",
    ],
    correctAnswer: "C",
    explanation:
      "Kaynak çeşitlendirmesi ve geri dönüşüm, kritik ham maddelerde tedarik riskini azaltmaya yardımcı olur.",
    points: 10,
    hint: "Haritadaki stratejik rezervleri hatırla; kritik madenlerde tek tedarikçi riskini kaynak çeşitliliği ve geri dönüşümle önleme mantığını düşün.",
    imageUrl: "/images/questions/turkiye_madenler.svg",
    imageAlt: "Türkiye Başlıca Stratejik Maden ve Enerji Hammaddeleri Dağılış Haritası",
  },
  {
    id: 28,
    unit: 5,
    difficulty: "orta",
    question:
      "Bir bölgede büyük bir sanayi tesisinin kurulmasının ardından göç artmış, konut ihtiyacı yükselmiş ve ulaşım yoğunlaşmıştır. Bu durum hangi ilişkiyi gösterir?",
    options: [
      "Ekonomik faaliyetlerin nüfus ve yerleşme düzenini değiştirebildiğini",
      "Sanayi faaliyetlerinin yerleşmelerden bağımsız olduğunu",
      "Göçlerin ekonomik koşullarla bağlantısının bulunmadığını",
      "Sanayileşmenin yalnızca iklim özelliklerini etkilediğini",
      "Ulaşım ihtiyaçlarının nüfusla hiçbir ilişkisinin olmadığını",
    ],
    correctAnswer: "A",
    explanation:
      "Sanayi faaliyetleri istihdam yaratarak göçü, yerleşme gelişimini ve altyapı ihtiyacını etkileyebilir.",
    points: 10,
    hint: "Sanayileşmenin nüfus göçü, altyapı ihtiyacı ve arazi dönüşümü üzerindeki zincirleme etkilerini düşün.",
  },
  {
    id: 29,
    unit: 5,
    difficulty: "zor",
    question:
      "İki tarım bölgesinin özellikleri şöyledir: A bölgesinde üretim yüksektir ancak yer altı suyu hızla tükenmekte ve toprak verimliliği düşmektedir. B bölgesinde üretim biraz daha düşüktür ancak su tüketimi kontrol altında tutulmakta ve toprak kalitesi korunmaktadır. Uzun vadeli sürdürülebilirlik açısından hangisi doğrudur?",
    options: [
      "A bölgesi yalnızca üretimi yüksek olduğu için daha sürdürülebilirdir",
      "B bölgesinde üretim yapmanın hiçbir ekonomik yararı yoktur",
      "Tarımda su tüketimi sürdürülebilirliği etkilemez",
      "B bölgesi doğal kaynakları koruduğu için uzun vadede daha sürdürülebilir olabilir",
      "Toprak kalitesi ile gelecekteki üretim arasında ilişki yoktur",
    ],
    correctAnswer: "D",
    explanation:
      "Sürdürülebilir tarım, güncel verim kadar gelecekteki üretimi mümkün kılan su ve toprak kaynaklarını da korumayı amaçlar.",
    points: 15,
    hint: "Sermaye, ileri teknoloji ve birim alandan yüksek verim elde edilen entansif tarımı hatırla.",
  },
  {
    id: 30,
    unit: 5,
    difficulty: "zor",
    question:
      "Haritada Türkiye'nin güneş enerjisi potansiyeli ve büyük GES yatırımları (ör. Konya Karapınar) gösterilmiştir. Fosil yakıt ithalatına bağımlı bir ülkenin bu potansiyeli değerlendirirken enerji güvenliği ve sürdürülebilirlik açısından hangi stratejiyi izlemesi en uygundur?",
    options: [
      "Bütün elektrik üretimini tek bir ithal enerji kaynağına bağlamak",
      "Yenilenebilir enerji, depolama, şebeke ve enerji verimliliği yatırımlarını birlikte geliştirmek",
      "Enerji kaynaklarını çeşitlendirmekten vazgeçmek",
      "Elektrik iletim altyapısını geliştirmemek",
      "Yalnızca fosil yakıt tüketimini artırmak",
    ],
    correctAnswer: "B",
    explanation:
      "Yenilenebilir kaynakların şebeke, depolama ve verimlilik yatırımlarıyla birlikte geliştirilmesi enerji arzının dayanıklılığını artırabilir.",
    points: 15,
    hint: "Haritadaki yüksek potansiyel kuşaklarını ve kesintili yenilenebilir enerjinin şebeke depolamayla desteklenmesi gereğini düşün.",
    imageUrl: "/images/questions/turkiye_gunes_enerji.svg",
    imageAlt: "Türkiye Güneş Enerjisi Potansiyeli ve Dönüşüm Dağılış Haritası (GEPA)",
  },
  {
    id: 31,
    unit: 6,
    difficulty: "kolay",
    question: "Gezegen sınırları yaklaşımının temel amacı nedir?",
    options: [
      "Bütün doğal süreçleri durdurmak",
      "Ülkeler arasındaki siyasi sınırları belirlemek",
      "Dünya'nın yüz ölçümünü büyütmek",
      "Doğal kaynak tüketimini sınırsız hâle getirmek",
      "Dünya sisteminin istikrarıyla ilişkili çevresel sınırları değerlendirmek",
    ],
    correctAnswer: "E",
    explanation:
      "Gezegen sınırları yaklaşımı, insan faaliyetlerinin Dünya sisteminin işleyişi üzerinde oluşturduğu riskleri değerlendirmek için kullanılır.",
    points: 5,
    hint: "Dünyanın ekolojik taşıma kapasitesini aşmadan dengenin korunması ilkesini hatırla.",
  },
  {
    id: 32,
    unit: 6,
    difficulty: "kolay",
    question:
      "Aşağıdakilerden hangisi iklim değişikliğiyle mücadelede sera gazı salımlarını azaltmaya yönelik bir uygulamadır?",
    options: [
      "Kömür kullanımını sınırsız artırmak",
      "Orman alanlarını azaltmak",
      "Enerji verimliliğini geliştirmek ve düşük karbonlu kaynaklar kullanmak",
      "Fosil yakıt israfını artırmak",
      "Bütün toplu taşıma sistemlerini kapatmak",
    ],
    correctAnswer: "C",
    explanation:
      "Enerji verimliliği ve düşük karbonlu enerji kaynakları sera gazı salımlarının azaltılmasını destekler.",
    points: 5,
    hint: "Fosil yakıt tüketimini azaltıp temiz enerjiye ve ormanlaştırmaya yönelmeyi göz önüne al.",
  },
  {
    id: 33,
    unit: 6,
    difficulty: "orta",
    question:
      "Sıcak hava dalgalarının giderek daha fazla etkilediği bir kentte hangi uygulama iklim değişikliğine uyum sağlamaya yöneliktir?",
    options: [
      "Yeşil alanları, gölgelendirmeyi ve sıcaklık erken uyarı sistemlerini artırmak",
      "Bütün parkları asfaltla kaplamak",
      "Sıcak hava dalgalarına ilişkin sağlık planlarını kaldırmak",
      "Kent içindeki ağaçların tamamını kesmek",
      "Yalnızca fosil yakıt tüketimini artırmak",
    ],
    correctAnswer: "A",
    explanation:
      "Yeşil altyapı, gölgeleme ve erken uyarı sistemleri aşırı sıcakların etkisini azaltmaya yardımcı olabilir.",
    points: 10,
    hint: "Kentsel ısı adası etkisini azaltacak yeşil alanlar ve yansıtıcı yüzeyleri düşün.",
  },
  {
    id: 34,
    unit: 6,
    difficulty: "orta",
    question:
      "Bir şehirde sel riskini azaltmak amacıyla yağmur bahçeleri, geçirgen kaldırımlar ve su tutma alanları yapılmaktadır. Bu uygulamaların ortak amacı nedir?",
    options: [
      "Bütün yağışların oluşmasını engellemek",
      "Yer altı su beslenmesini tamamen durdurmak",
      "Şehirdeki bütün suyu deniz suyuna dönüştürmek",
      "Yağmur suyunu tutmak, sızmasını artırmak ve yüzey akışını azaltmak",
      "Yağışları yalnızca başka ülkelere yönlendirmek",
    ],
    correctAnswer: "D",
    explanation:
      "Bu yöntemler sünger şehir yaklaşımıyla ilişkilidir ve yağmur suyunun daha doğal biçimde yönetilmesine yardımcı olur.",
    points: 10,
    hint: "Suyun toprağa sızmasını artıran doğal ve geçirimli yüzeylerin önemini değerlendir.",
  },
  {
    id: 35,
    unit: 6,
    difficulty: "zor",
    question:
      "Grafikte bir bölgenin 1995–2025 yılları arasındaki yıllık yağış miktarı ile toplam su tüketimi trendi gösterilmiştir. Yağış ortalaması belirgin biçimde değişmemesine rağmen, tüketimin yağışı aştığı dönemde su kıtlığı ve kuraklık riskinin artmasıyla ilgili hangi çıkarım en doğrudur?",
    options: [
      "Su kıtlığının tek nedeni yağış azalmasıdır",
      "Artan su talebi ve yetersiz kaynak yönetimi, yağış değişmese bile su kıtlığını artırabilir",
      "Su tüketiminin su kıtlığı üzerinde etkisi bulunmaz",
      "Yağışın değişmemesi bütün su kaynaklarının korunmasını garanti eder",
      "Sanayi faaliyetleri su kaynakları üzerinde baskı oluşturmaz",
    ],
    correctAnswer: "B",
    explanation:
      "Su kıtlığı yalnızca yağışla değil; artan nüfus, sulu tarım, sanayi talebi ve havza yönetimindeki yetersizliklerle de doğrudan ilişkilidir.",
    points: 15,
    hint: "Grafikteki kritik su açığı bölgesine ve su talebinin yağış kapasitesini aştığı döneme odaklan.",
    imageUrl: "/images/questions/su_tuketimi_kuraklik_grafigi.svg",
    imageAlt: "Yıllık Yağış ve Toplam Su Tüketimi Kuraklık Riski Analiz Grafiği",
  },
  {
    id: 36,
    unit: 6,
    difficulty: "zor",
    question:
      "Bir kıyı kentinde deniz seviyesinin yükselmesi, aşırı yağışların artması ve geçirimsiz yüzeylerin genişlemesi birlikte görülmektedir. Aşağıdaki önlemlerden hangisi taşkın riskini azaltmada en bütüncül yaklaşımdır?",
    options: [
      "Kıyıdaki bütün boş alanlara bina yapmak",
      "Yağmur sularını hiçbir planlama olmadan kanalizasyona aktarmak",
      "Risk haritalarını ve erken uyarı sistemlerini kullanmamak",
      "Yalnızca binaların dış cephelerini yenilemek",
      "Kıyı taşkın planlaması, geçirgen altyapı, erken uyarı ve riskli alanlarda yapılaşma kontrolünü birlikte uygulamak",
    ],
    correctAnswer: "E",
    explanation:
      "Farklı kaynaklardan oluşan afet riskleri birden fazla uyum ve risk azaltma önleminin birlikte uygulanmasını gerektirir.",
    points: 15,
    hint: "Kıyı erozyonu, tatlı su akiferlerine tuzlu su karışması ve taşkın risklerini hatırla.",
  },
  {
    id: 37,
    unit: 7,
    difficulty: "kolay",
    question:
      "Türkiye'nin kültürel hinterlandının oluşumunda aşağıdakilerden hangisi etkili olmuştur?",
    options: [
      "Yalnızca ülkelerin yüz ölçümlerinin benzer olması",
      "Sadece yağış miktarlarının aynı olması",
      "Ortak tarih, dil, kültür ve toplumsal bağlar",
      "Bütün ülkelerin aynı iklim kuşağında bulunması",
      "Yalnızca aynı yer şekillerine sahip olunması",
    ],
    correctAnswer: "C",
    explanation:
      "Kültürel hinterlant ortak tarihsel, dilsel, toplumsal ve kültürel ilişkiler üzerinden gelişebilir.",
    points: 5,
    hint: "Tarihsel bağlar, dil ve ortak kültürel mirasın oluşturduğu nüfuz alanını düşün.",
  },
  {
    id: 38,
    unit: 7,
    difficulty: "kolay",
    question:
      "Hollanda'nın tarımsal üretimde yüksek verim elde etmesinde aşağıdakilerden hangisi önemli rol oynar?",
    options: [
      "Seracılık, modern teknoloji ve verimli üretim yöntemleri",
      "Bütün tarım teknolojilerinin terk edilmesi",
      "Tarım alanlarının tamamen kapatılması",
      "Yalnızca geleneksel yöntemlerin kullanılması",
      "Bütün tarım alanlarının sanayi tesisine dönüştürülmesi",
    ],
    correctAnswer: "A",
    explanation:
      "Hollanda modern ve teknoloji yoğun tarım uygulamalarıyla öne çıkan ülkelerden biridir.",
    points: 5,
    hint: "Dar yüzölçümüne rağmen modern seracılık, tohum ıslahı ve Ar-Ge yatırımlarını hatırla.",
  },
  {
    id: 39,
    unit: 7,
    difficulty: "orta",
    question:
      "Almanya ve Mısır'ın sanayileşme süreçlerini karşılaştıran bir araştırmacının hangi ölçütleri birlikte değerlendirmesi daha uygundur?",
    options: [
      "Ülkelerin bayrak renklerini",
      "Yalnızca isimlerinin uzunluğunu",
      "Yalnızca saat dilimlerini",
      "Sanayi altyapısı, teknolojik gelişme, iş gücü ve tarihsel koşulları",
      "Yalnızca enlem değerlerini",
    ],
    correctAnswer: "D",
    explanation:
      "Sanayileşme süreçleri ekonomik, teknolojik, tarihsel ve toplumsal koşullarla birlikte açıklanabilir.",
    points: 10,
    hint: "Tarihsel sermaye birikimi, teknoloji ve sanayi devrimi başlangıç dönemlerini kıyasla.",
  },
  {
    id: 40,
    unit: 7,
    difficulty: "orta",
    question:
      "Avustralya'da madencilik faaliyetlerinin ekonomik ve mekânsal etkilerini incelemek isteyen bir araştırmacı hangi verilerden öncelikle yararlanmalıdır?",
    options: [
      "Yalnızca spor kulüplerinin dağılışı",
      "Maden yataklarının konumu, ulaşım altyapısı ve ihracat bağlantıları",
      "Sadece turistik plaj isimleri",
      "Yalnızca ülkedeki festivaller",
      "Sadece nüfusun yaş ortalaması",
    ],
    correctAnswer: "B",
    explanation:
      "Madencilik faaliyetlerinin gelişimi kaynak dağılışı, ulaşım altyapısı ve uluslararası ticaret bağlantılarıyla ilişkilidir.",
    points: 10,
    hint: "Zengin yer altı kaynaklarının ihracatı ile ekonomik büyüme arasındaki ilişkiyi düşün.",
  },
  {
    id: 41,
    unit: 7,
    difficulty: "zor",
    question:
      "Hollanda'nın yüksek teknolojiye dayalı tarımsal üretimi ile Avustralya'nın madencilik faaliyetleri karşılaştırıldığında hangi genellemeye ulaşmak daha doğrudur?",
    options: [
      "Ekonomik uzmanlaşmayı yalnızca nüfus sayısı belirler",
      "Bütün ülkeler aynı doğal kaynaklara sahiptir",
      "Doğal koşullar ekonomik faaliyetlerle hiçbir şekilde ilişkili değildir",
      "Ekonomik uzmanlaşma yalnızca ülkelerin siyasi sınırlarına bağlıdır",
      "Doğal kaynaklar, teknoloji, sermaye ve altyapı birlikte ülkelerin ekonomik uzmanlaşmasını biçimlendirir",
    ],
    correctAnswer: "E",
    explanation:
      "Ekonomik uzmanlaşma, doğal koşulların yanı sıra kaynakları kullanma ve geliştirme kapasitesine de bağlıdır.",
    points: 15,
    hint: "Dikey tarım, yapay zeka destekli seralar ve yüksek katma değerli tarım teknolojilerini hatırla.",
  },
  {
    id: 42,
    unit: 7,
    difficulty: "zor",
    question:
      "Rusya ve Suudi Arabistan'ın küresel enerji piyasalarındaki rolü düşünüldüğünde, bir enerji ithalatçısı ülkenin ihtiyaçlarının çok büyük bölümünü tek tedarikçiden karşılaması hangi riski artırır?",
    options: [
      "Enerji ithalatının kendiliğinden sona ermesini",
      "Bütün enerji fiyatlarının daima sabit kalmasını",
      "Jeopolitik gelişmeler ve arz kesintileri karşısında kırılganlığı",
      "Ülkenin enerji ihtiyacının tamamen ortadan kalkmasını",
      "Enerji kaynaklarının otomatik olarak yenilenebilir hâle gelmesini",
    ],
    correctAnswer: "C",
    explanation:
      "Enerjide tek tedarikçiye bağımlı olmak, uluslararası kriz ve arz kesintilerine karşı kırılganlığı artırabilir.",
    points: 15,
    hint: "Petrol ve doğalgaz rezervlerinin OPEC ve küresel enerji arz dengesindeki rolünü değerlendir.",
  },
];
