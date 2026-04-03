import { MealSlot, DAYS, MEAL_TIMES } from "@/types/mealPlan";
import { Recipe } from "@/types/recipe";

const mockRecipes: Recipe[] = [
  // Sarapan
  {
    id: "mock-1", nama: "Bubur Ayam Bandung", deskripsi: "Bubur ayam khas Bandung dengan cakwe dan kerupuk", waktu: "25 menit", porsi: "4 porsi", tingkatKesulitan: "Mudah", masakan: "Indonesia",
    estimasiBiaya: 20000,
    bahan: [{ item: "Beras", jumlah: "200g" }, { item: "Ayam suwir", jumlah: "150g" }, { item: "Kecap asin", jumlah: "1 sdm" }],
    langkah: ["Masak beras dengan air hingga menjadi bubur", "Tambahkan ayam suwir dan kecap", "Sajikan dengan cakwe dan kerupuk"],
    nutrisi: { kalori: 280, protein: 18, karbohidrat: 35, lemak: 8 },
  },
  {
    id: "mock-2", nama: "Roti Bakar Telur Keju", deskripsi: "Roti bakar dengan telur orak-arik dan keju meleleh", waktu: "15 menit", porsi: "2 porsi", tingkatKesulitan: "Mudah", masakan: "Western",
    estimasiBiaya: 15000,
    bahan: [{ item: "Roti tawar", jumlah: "4 lembar" }, { item: "Telur", jumlah: "3 butir" }, { item: "Keju", jumlah: "50g" }],
    langkah: ["Panggang roti hingga kecokelatan", "Buat telur orak-arik", "Sajikan roti dengan telur dan keju"],
    nutrisi: { kalori: 320, protein: 20, karbohidrat: 28, lemak: 14 },
  },
  {
    id: "mock-3", nama: "Smoothie Bowl Pisang", deskripsi: "Smoothie bowl segar dengan granola dan buah", waktu: "10 menit", porsi: "2 porsi", tingkatKesulitan: "Mudah", masakan: "Western",
    estimasiBiaya: 18000,
    bahan: [{ item: "Pisang beku", jumlah: "3 buah" }, { item: "Yogurt", jumlah: "100ml" }, { item: "Granola", jumlah: "50g" }],
    langkah: ["Blender pisang beku dengan yogurt", "Tuang ke mangkuk", "Taburi granola dan buah segar"],
    nutrisi: { kalori: 250, protein: 8, karbohidrat: 42, lemak: 6 },
  },
  {
    id: "mock-4", nama: "Nasi Goreng Kampung", deskripsi: "Nasi goreng pedas dengan telur dan kerupuk", waktu: "20 menit", porsi: "3 porsi", tingkatKesulitan: "Mudah", masakan: "Indonesia",
    estimasiBiaya: 18000,
    bahan: [{ item: "Nasi putih", jumlah: "3 piring" }, { item: "Telur", jumlah: "3 butir" }, { item: "Cabai rawit", jumlah: "5 buah" }],
    langkah: ["Tumis bumbu halus", "Masukkan nasi, aduk rata", "Tambahkan telur, aduk hingga matang"],
    nutrisi: { kalori: 380, protein: 14, karbohidrat: 48, lemak: 15 },
  },
  {
    id: "mock-5", nama: "Lontong Sayur", deskripsi: "Lontong dengan kuah santan dan lauk pauk", waktu: "30 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 22000,
    bahan: [{ item: "Lontong", jumlah: "4 buah" }, { item: "Santan", jumlah: "400ml" }, { item: "Labu siam", jumlah: "1 buah" }],
    langkah: ["Rebus santan dengan bumbu", "Masukkan sayuran, masak hingga empuk", "Sajikan dengan lontong"],
    nutrisi: { kalori: 340, protein: 10, karbohidrat: 40, lemak: 16 },
  },
  {
    id: "mock-6", nama: "Pancake Oatmeal", deskripsi: "Pancake sehat dari oatmeal dengan madu", waktu: "20 menit", porsi: "2 porsi", tingkatKesulitan: "Mudah", masakan: "Western",
    estimasiBiaya: 16000,
    bahan: [{ item: "Oatmeal", jumlah: "100g" }, { item: "Telur", jumlah: "2 butir" }, { item: "Madu", jumlah: "2 sdm" }],
    langkah: ["Blender oat hingga halus", "Campur dengan telur", "Panggang di teflon, sajikan dengan madu"],
    nutrisi: { kalori: 290, protein: 12, karbohidrat: 38, lemak: 10 },
  },
  {
    id: "mock-7", nama: "Bubur Kacang Hijau", deskripsi: "Bubur kacang hijau hangat dengan santan", waktu: "30 menit", porsi: "4 porsi", tingkatKesulitan: "Mudah", masakan: "Indonesia",
    estimasiBiaya: 12000,
    bahan: [{ item: "Kacang hijau", jumlah: "200g" }, { item: "Gula merah", jumlah: "100g" }, { item: "Santan", jumlah: "200ml" }],
    langkah: ["Rendam kacang hijau 2 jam", "Rebus hingga empuk", "Tambahkan gula merah dan santan"],
    nutrisi: { kalori: 260, protein: 10, karbohidrat: 44, lemak: 5 },
  },
  // Makan Siang
  {
    id: "mock-8", nama: "Ayam Geprek Sambal Bawang", deskripsi: "Ayam goreng tepung digeprek dengan sambal bawang pedas", waktu: "30 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 35000,
    bahan: [{ item: "Dada ayam", jumlah: "500g" }, { item: "Tepung terigu", jumlah: "200g" }, { item: "Cabai merah", jumlah: "10 buah" }],
    langkah: ["Lumuri ayam dengan tepung bumbu", "Goreng hingga keemasan", "Geprek dan siram sambal bawang"],
    nutrisi: { kalori: 450, protein: 35, karbohidrat: 30, lemak: 22 },
  },
  {
    id: "mock-9", nama: "Rendang Daging Sapi", deskripsi: "Rendang khas Padang dengan rempah lengkap", waktu: "120 menit", porsi: "6 porsi", tingkatKesulitan: "Sulit", masakan: "Indonesia",
    estimasiBiaya: 65000,
    bahan: [{ item: "Daging sapi", jumlah: "500g" }, { item: "Santan kental", jumlah: "400ml" }, { item: "Bumbu rendang", jumlah: "1 paket" }],
    langkah: ["Tumis bumbu halus hingga harum", "Masukkan daging dan santan", "Masak dengan api kecil hingga kering"],
    nutrisi: { kalori: 520, protein: 38, karbohidrat: 8, lemak: 38 },
  },
  {
    id: "mock-10", nama: "Capcay Seafood", deskripsi: "Tumis sayuran campur dengan udang dan cumi", waktu: "25 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Chinese",
    estimasiBiaya: 40000,
    bahan: [{ item: "Udang", jumlah: "200g" }, { item: "Cumi", jumlah: "150g" }, { item: "Sayuran campur", jumlah: "300g" }],
    langkah: ["Tumis bawang putih", "Masukkan seafood, masak setengah matang", "Tambahkan sayuran dan saus tiram"],
    nutrisi: { kalori: 280, protein: 28, karbohidrat: 15, lemak: 12 },
  },
  {
    id: "mock-11", nama: "Soto Ayam Lamongan", deskripsi: "Soto kuning khas Lamongan dengan koya", waktu: "45 menit", porsi: "5 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 32000,
    bahan: [{ item: "Ayam kampung", jumlah: "500g" }, { item: "Kunyit", jumlah: "3 ruas" }, { item: "Bihun", jumlah: "100g" }],
    langkah: ["Rebus ayam dengan bumbu kuning", "Suwir ayam, saring kaldu", "Sajikan dengan bihun dan koya"],
    nutrisi: { kalori: 380, protein: 30, karbohidrat: 32, lemak: 14 },
  },
  {
    id: "mock-12", nama: "Mie Goreng Jawa", deskripsi: "Mie goreng manis khas Jawa dengan kol dan telur", waktu: "20 menit", porsi: "3 porsi", tingkatKesulitan: "Mudah", masakan: "Indonesia",
    estimasiBiaya: 18000,
    bahan: [{ item: "Mie telur", jumlah: "250g" }, { item: "Kol", jumlah: "100g" }, { item: "Kecap manis", jumlah: "3 sdm" }],
    langkah: ["Rebus mie sebentar, tiriskan", "Tumis sayuran dan telur", "Masukkan mie dan kecap manis, aduk rata"],
    nutrisi: { kalori: 420, protein: 16, karbohidrat: 52, lemak: 16 },
  },
  {
    id: "mock-13", nama: "Gado-Gado Jakarta", deskripsi: "Sayuran rebus dengan bumbu kacang khas Jakarta", waktu: "30 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 22000,
    bahan: [{ item: "Kacang tanah", jumlah: "200g" }, { item: "Tahu tempe", jumlah: "200g" }, { item: "Sayuran campur", jumlah: "400g" }],
    langkah: ["Rebus sayuran hingga matang", "Buat bumbu kacang", "Siram sayuran dengan bumbu, tambahkan kerupuk"],
    nutrisi: { kalori: 350, protein: 18, karbohidrat: 28, lemak: 20 },
  },
  {
    id: "mock-14", nama: "Nasi Liwet Solo", deskripsi: "Nasi gurih khas Solo dengan lauk lengkap", waktu: "40 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 30000,
    bahan: [{ item: "Beras", jumlah: "400g" }, { item: "Santan", jumlah: "300ml" }, { item: "Ayam suwir", jumlah: "200g" }],
    langkah: ["Masak beras dengan santan dan bumbu", "Siapkan lauk pelengkap", "Sajikan nasi liwet dengan lauk"],
    nutrisi: { kalori: 450, protein: 22, karbohidrat: 55, lemak: 16 },
  },
  // Makan Malam
  {
    id: "mock-15", nama: "Ikan Bakar Jimbaran", deskripsi: "Ikan kakap bakar dengan sambal matah khas Bali", waktu: "35 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 45000,
    bahan: [{ item: "Ikan kakap", jumlah: "1 ekor" }, { item: "Bawang merah", jumlah: "10 butir" }, { item: "Serai", jumlah: "3 batang" }],
    langkah: ["Lumuri ikan dengan bumbu", "Bakar di atas arang hingga matang", "Sajikan dengan sambal matah"],
    nutrisi: { kalori: 320, protein: 35, karbohidrat: 5, lemak: 18 },
  },
  {
    id: "mock-16", nama: "Sup Buntut", deskripsi: "Sup buntut sapi bening dengan rempah", waktu: "90 menit", porsi: "5 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 55000,
    bahan: [{ item: "Buntut sapi", jumlah: "500g" }, { item: "Wortel", jumlah: "2 buah" }, { item: "Kentang", jumlah: "2 buah" }],
    langkah: ["Rebus buntut hingga empuk", "Tambahkan sayuran", "Bumbui dan sajikan panas"],
    nutrisi: { kalori: 400, protein: 32, karbohidrat: 20, lemak: 22 },
  },
  {
    id: "mock-17", nama: "Tumis Kangkung Terasi", deskripsi: "Kangkung tumis pedas dengan terasi", waktu: "15 menit", porsi: "3 porsi", tingkatKesulitan: "Mudah", masakan: "Indonesia",
    estimasiBiaya: 12000,
    bahan: [{ item: "Kangkung", jumlah: "2 ikat" }, { item: "Terasi", jumlah: "1 sdt" }, { item: "Cabai merah", jumlah: "5 buah" }],
    langkah: ["Tumis bumbu dan terasi", "Masukkan kangkung", "Aduk hingga layu, sajikan"],
    nutrisi: { kalori: 120, protein: 6, karbohidrat: 10, lemak: 7 },
  },
  {
    id: "mock-18", nama: "Ayam Teriyaki", deskripsi: "Ayam panggang dengan saus teriyaki manis gurih", waktu: "30 menit", porsi: "4 porsi", tingkatKesulitan: "Mudah", masakan: "Japanese",
    estimasiBiaya: 35000,
    bahan: [{ item: "Paha ayam", jumlah: "500g" }, { item: "Kecap asin", jumlah: "3 sdm" }, { item: "Madu", jumlah: "2 sdm" }],
    langkah: ["Marinasi ayam dengan saus teriyaki", "Panggang di teflon hingga karamel", "Sajikan dengan nasi dan sayuran"],
    nutrisi: { kalori: 380, protein: 30, karbohidrat: 18, lemak: 20 },
  },
  {
    id: "mock-19", nama: "Pecel Lele Sambal Lalapan", deskripsi: "Lele goreng garing dengan sambal dan lalapan segar", waktu: "25 menit", porsi: "3 porsi", tingkatKesulitan: "Mudah", masakan: "Indonesia",
    estimasiBiaya: 22000,
    bahan: [{ item: "Lele", jumlah: "3 ekor" }, { item: "Sambal terasi", jumlah: "secukupnya" }, { item: "Lalapan", jumlah: "1 set" }],
    langkah: ["Goreng lele hingga garing", "Siapkan sambal terasi", "Sajikan dengan nasi dan lalapan"],
    nutrisi: { kalori: 360, protein: 28, karbohidrat: 25, lemak: 18 },
  },
  {
    id: "mock-20", nama: "Tahu Tempe Bacem", deskripsi: "Tahu dan tempe bacem manis khas Jogja", waktu: "40 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 15000,
    bahan: [{ item: "Tahu", jumlah: "4 buah" }, { item: "Tempe", jumlah: "2 papan" }, { item: "Gula merah", jumlah: "100g" }],
    langkah: ["Rebus tahu tempe dengan bumbu bacem", "Angkat dan goreng sebentar", "Sajikan dengan nasi hangat"],
    nutrisi: { kalori: 280, protein: 18, karbohidrat: 22, lemak: 14 },
  },
  {
    id: "mock-21", nama: "Sop Iga Bakar", deskripsi: "Iga sapi bakar madu dengan saus BBQ", waktu: "60 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Western",
    estimasiBiaya: 55000,
    bahan: [{ item: "Iga sapi", jumlah: "500g" }, { item: "Saus BBQ", jumlah: "100ml" }, { item: "Madu", jumlah: "3 sdm" }],
    langkah: ["Rebus iga hingga empuk", "Olesi saus BBQ dan madu", "Panggang hingga karamel"],
    nutrisi: { kalori: 480, protein: 35, karbohidrat: 15, lemak: 32 },
  },
  // Extra Sarapan
  {
    id: "mock-22", nama: "Nasi Uduk Betawi", deskripsi: "Nasi gurih khas Betawi dengan lauk lengkap", waktu: "30 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 20000,
    bahan: [{ item: "Beras", jumlah: "400g" }, { item: "Santan", jumlah: "200ml" }, { item: "Daun salam", jumlah: "2 lembar" }],
    langkah: ["Masak beras dengan santan dan daun salam", "Goreng tempe dan tahu", "Sajikan dengan sambal kacang"],
    nutrisi: { kalori: 350, protein: 12, karbohidrat: 48, lemak: 12 },
  },
  {
    id: "mock-23", nama: "Telur Dadar Padang", deskripsi: "Telur dadar tebal khas Padang dengan daun singkong", waktu: "15 menit", porsi: "2 porsi", tingkatKesulitan: "Mudah", masakan: "Indonesia",
    estimasiBiaya: 10000,
    bahan: [{ item: "Telur", jumlah: "4 butir" }, { item: "Daun bawang", jumlah: "2 batang" }, { item: "Cabai hijau", jumlah: "3 buah" }],
    langkah: ["Kocok telur dengan bumbu", "Goreng dengan minyak banyak", "Angkat saat keemasan"],
    nutrisi: { kalori: 270, protein: 16, karbohidrat: 5, lemak: 20 },
  },
  {
    id: "mock-24", nama: "Ketoprak Jakarta", deskripsi: "Ketoprak dengan bumbu kacang khas Jakarta", waktu: "20 menit", porsi: "3 porsi", tingkatKesulitan: "Mudah", masakan: "Indonesia",
    estimasiBiaya: 15000,
    bahan: [{ item: "Tahu goreng", jumlah: "200g" }, { item: "Bihun", jumlah: "100g" }, { item: "Kacang tanah", jumlah: "150g" }],
    langkah: ["Rebus bihun dan lontong", "Buat bumbu kacang", "Sajikan semua dengan kerupuk"],
    nutrisi: { kalori: 310, protein: 14, karbohidrat: 38, lemak: 12 },
  },
  {
    id: "mock-25", nama: "Overnight Oats Berry", deskripsi: "Oat semalam dengan campuran berry segar", waktu: "5 menit", porsi: "1 porsi", tingkatKesulitan: "Mudah", masakan: "Western",
    estimasiBiaya: 20000,
    bahan: [{ item: "Rolled oats", jumlah: "50g" }, { item: "Susu", jumlah: "150ml" }, { item: "Mixed berry", jumlah: "50g" }],
    langkah: ["Campur oat dan susu", "Simpan di kulkas semalaman", "Taburi berry saat sajikan"],
    nutrisi: { kalori: 220, protein: 8, karbohidrat: 36, lemak: 5 },
  },
  // Extra Makan Siang
  {
    id: "mock-26", nama: "Ayam Bakar Taliwang", deskripsi: "Ayam bakar pedas khas Lombok", waktu: "45 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 38000,
    bahan: [{ item: "Ayam kampung", jumlah: "1 ekor" }, { item: "Cabai kering", jumlah: "15 buah" }, { item: "Terasi", jumlah: "1 sdt" }],
    langkah: ["Bakar ayam setengah matang", "Olesi bumbu taliwang", "Bakar lagi hingga matang sempurna"],
    nutrisi: { kalori: 420, protein: 32, karbohidrat: 8, lemak: 28 },
  },
  {
    id: "mock-27", nama: "Rawon Surabaya", deskripsi: "Sup daging hitam khas Surabaya dengan kluwek", waktu: "90 menit", porsi: "5 porsi", tingkatKesulitan: "Sulit", masakan: "Indonesia",
    estimasiBiaya: 50000,
    bahan: [{ item: "Daging sapi", jumlah: "500g" }, { item: "Kluwek", jumlah: "5 buah" }, { item: "Tauge", jumlah: "100g" }],
    langkah: ["Rebus daging hingga empuk", "Tumis bumbu dengan kluwek", "Gabungkan dan masak hingga meresap"],
    nutrisi: { kalori: 380, protein: 30, karbohidrat: 12, lemak: 24 },
  },
  {
    id: "mock-28", nama: "Nasi Kuning Manado", deskripsi: "Nasi kuning khas Manado dengan cakalang", waktu: "35 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 28000,
    bahan: [{ item: "Beras", jumlah: "400g" }, { item: "Kunyit", jumlah: "3 ruas" }, { item: "Ikan cakalang", jumlah: "200g" }],
    langkah: ["Masak nasi dengan kunyit dan santan", "Suwir cakalang, tumis dengan bumbu", "Sajikan nasi kuning dengan lauk"],
    nutrisi: { kalori: 400, protein: 24, karbohidrat: 50, lemak: 12 },
  },
  {
    id: "mock-29", nama: "Bakso Malang", deskripsi: "Bakso urat khas Malang dengan tahu goreng", waktu: "60 menit", porsi: "5 porsi", tingkatKesulitan: "Sulit", masakan: "Indonesia",
    estimasiBiaya: 35000,
    bahan: [{ item: "Daging sapi giling", jumlah: "300g" }, { item: "Tepung tapioka", jumlah: "100g" }, { item: "Mie kuning", jumlah: "200g" }],
    langkah: ["Buat adonan bakso, bentuk bulat", "Rebus bakso hingga mengapung", "Sajikan dengan kuah kaldu dan mie"],
    nutrisi: { kalori: 350, protein: 22, karbohidrat: 35, lemak: 14 },
  },
  // Extra Makan Malam
  {
    id: "mock-30", nama: "Gulai Ikan Patin", deskripsi: "Gulai ikan patin khas Jambi dengan bumbu kuning", waktu: "40 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 35000,
    bahan: [{ item: "Ikan patin", jumlah: "500g" }, { item: "Santan", jumlah: "400ml" }, { item: "Kunyit", jumlah: "3 ruas" }],
    langkah: ["Tumis bumbu halus", "Masukkan santan dan ikan", "Masak hingga bumbu meresap"],
    nutrisi: { kalori: 360, protein: 28, karbohidrat: 10, lemak: 24 },
  },
  {
    id: "mock-31", nama: "Sate Ayam Madura", deskripsi: "Sate ayam dengan bumbu kacang khas Madura", waktu: "35 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 30000,
    bahan: [{ item: "Dada ayam", jumlah: "400g" }, { item: "Kacang tanah", jumlah: "150g" }, { item: "Kecap manis", jumlah: "3 sdm" }],
    langkah: ["Potong ayam dadu, tusuk sate", "Bakar di atas arang", "Sajikan dengan bumbu kacang dan lontong"],
    nutrisi: { kalori: 380, protein: 30, karbohidrat: 18, lemak: 22 },
  },
  {
    id: "mock-32", nama: "Sayur Asem Jakarta", deskripsi: "Sayur asem segar khas Betawi", waktu: "30 menit", porsi: "4 porsi", tingkatKesulitan: "Mudah", masakan: "Indonesia",
    estimasiBiaya: 15000,
    bahan: [{ item: "Jagung manis", jumlah: "2 buah" }, { item: "Kacang panjang", jumlah: "100g" }, { item: "Asam jawa", jumlah: "2 sdm" }],
    langkah: ["Rebus air dengan asam jawa", "Masukkan sayuran bertahap", "Masak hingga semua empuk"],
    nutrisi: { kalori: 150, protein: 6, karbohidrat: 28, lemak: 3 },
  },
  {
    id: "mock-33", nama: "Tongseng Kambing", deskripsi: "Tongseng kambing pedas manis dengan kol", waktu: "50 menit", porsi: "4 porsi", tingkatKesulitan: "Sedang", masakan: "Indonesia",
    estimasiBiaya: 55000,
    bahan: [{ item: "Daging kambing", jumlah: "400g" }, { item: "Kol", jumlah: "200g" }, { item: "Tomat", jumlah: "3 buah" }],
    langkah: ["Tumis bumbu hingga harum", "Masukkan kambing, masak hingga empuk", "Tambahkan kol dan tomat, aduk rata"],
    nutrisi: { kalori: 420, protein: 32, karbohidrat: 15, lemak: 26 },
  },
];

export function generateMockMealPlan(currentSlots: MealSlot[]): MealSlot[] {
  const sarapanRecipes = mockRecipes.slice(0, 7);
  const siangRecipes = mockRecipes.slice(7, 14);
  const malamRecipes = mockRecipes.slice(14, 21);

  return currentSlots.map((slot, _idx) => {
    if (slot.isLocked || slot.isSkipped) return slot;

    let pool: Recipe[];
    if (slot.mealTime === "sarapan") pool = sarapanRecipes;
    else if (slot.mealTime === "makan_siang") pool = siangRecipes;
    else pool = malamRecipes;

    const recipe = pool[slot.dayIndex % pool.length];

    return { ...slot, recipe: { ...recipe, id: `mock-${slot.id}` } };
  });
}
