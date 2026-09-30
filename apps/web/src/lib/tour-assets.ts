import type { Tour } from '@tour/shared';

export const TOUR_IMAGES: Record<string, string> = {
  'vinh-ha-long-du-thuyen-kayak': '/tour-ha-long.jpg',
  'sa-pa-chinh-phuc-fansipan-cat-cat': '/tour-sapa.jpg',
  'ninh-binh-trang-an-bai-dinh-hang-mua': '/tour-ninh-binh.jpg',
  'da-nang-hoi-an-ba-na-hills-cau-vang': '/tour-da-nang.jpg',
  'hue-co-do-dai-noi-ca-hue-song-huong': '/tour-hue.jpg',
  'nha-trang-bien-xanh-dao-diep-son': '/tour-nha-trang.jpg',
  'phu-quoc-dao-ngoc-lan-ngam-san-ho': '/tour-phu-quoc.jpg',
  'can-tho-cho-noi-cai-rang-miet-vuon': '/tour-can-tho.jpg',
  'tay-ninh-nui-ba-den-toa-thanh': '/tour-tay-ninh.jpg',
};

export type TourGalleryImage = {
  src: string;
  altVi: string;
  altEn: string;
  credit?: string;
  sourceUrl?: string;
};

const commonsFile = (name: string) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(name)}?width=1600`;

export const TOUR_GALLERIES: Record<string, TourGalleryImage[]> = {
  'vinh-ha-long-du-thuyen-kayak': [
    {
      src: '/tour-ha-long.jpg',
      altVi: 'Toàn cảnh Vịnh Hạ Long',
      altEn: 'Panoramic view of Ha Long Bay',
    },
    {
      src: commonsFile('Ha Long Bay (52070059279).jpg'),
      altVi: 'Các đảo đá vôi trên Vịnh Hạ Long',
      altEn: 'Limestone islands in Ha Long Bay',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ha_Long_Bay_(52070059279).jpg',
    },
    {
      src: commonsFile('Ha Long Bay, Vietnam.jpg'),
      altVi: 'Cảnh quan di sản Vịnh Hạ Long',
      altEn: 'World heritage scenery in Ha Long Bay',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Ha_Long_Bay,_Vietnam.jpg',
    },
  ],
  'sa-pa-chinh-phuc-fansipan-cat-cat': [
    {
      src: '/tour-sapa.jpg',
      altVi: 'Phong cảnh Sa Pa',
      altEn: 'Sa Pa landscape',
    },
    {
      src: commonsFile('Rice terraces in Sapa, Vietnam.jpg'),
      altVi: 'Ruộng bậc thang Sa Pa',
      altEn: 'Rice terraces in Sa Pa',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rice_terraces_in_Sapa,_Vietnam.jpg',
    },
    {
      src: commonsFile('Der Fansipan.jpg'),
      altVi: 'Đỉnh Fansipan nhìn từ Sa Pa',
      altEn: 'Fansipan viewed from Sa Pa',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Der_Fansipan.jpg',
    },
  ],
  'ninh-binh-trang-an-bai-dinh-hang-mua': [
    {
      src: '/tour-ninh-binh.jpg',
      altVi: 'Cảnh quan Ninh Bình',
      altEn: 'Ninh Binh landscape',
    },
    {
      src: commonsFile('Vietnam, Ninh Binh, Trang An Area.jpg'),
      altVi: 'Quần thể danh thắng Tràng An',
      altEn: 'Trang An scenic landscape',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Vietnam,_Ninh_Binh,_Trang_An_Area.jpg',
    },
    {
      src: commonsFile('Vietnam, Ninh Binh, Trang An River.jpg'),
      altVi: 'Sông và núi đá vôi Tràng An',
      altEn: 'River and limestone scenery in Trang An',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Vietnam,_Ninh_Binh,_Trang_An_River.jpg',
    },
  ],
  'da-nang-hoi-an-ba-na-hills-cau-vang': [
    {
      src: '/tour-da-nang.jpg',
      altVi: 'Cảnh quan Đà Nẵng',
      altEn: 'Da Nang scenery',
    },
    {
      src: commonsFile('Golden Bridge above the clouds Ba Na Hills Da Nang Vietnam.jpg'),
      altVi: 'Cầu Vàng trên Bà Nà Hills',
      altEn: 'Golden Bridge above the clouds at Ba Na Hills',
      credit: 'Wikimedia Commons',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Golden_Bridge_above_the_clouds_Ba_Na_Hills_Da_Nang_Vietnam.jpg',
    },
    {
      src: commonsFile('HoiAn VietNam.jpg'),
      altVi: 'Một góc phố cổ Hội An',
      altEn: 'A corner of Hoi An Ancient Town',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:HoiAn_VietNam.jpg',
    },
  ],
  'hue-co-do-dai-noi-ca-hue-song-huong': [
    {
      src: '/tour-hue.jpg',
      altVi: 'Cố đô Huế',
      altEn: 'Hue heritage scenery',
    },
    {
      src: commonsFile('Imperial City, Hue, Vietnam (49574900481).jpg'),
      altVi: 'Không gian Đại Nội Huế',
      altEn: 'Inside the Imperial City of Hue',
      credit: 'Wikimedia Commons',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Imperial_City,_Hue,_Vietnam_(49574900481).jpg',
    },
    {
      src: commonsFile('Hue Imperial City (40872823400).jpg'),
      altVi: 'Kiến trúc Hoàng thành Huế',
      altEn: 'Architecture of the Hue Imperial City',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Hue_Imperial_City_(40872823400).jpg',
    },
  ],
  'nha-trang-bien-xanh-dao-diep-son': [
    {
      src: '/tour-nha-trang.jpg',
      altVi: 'Biển Nha Trang',
      altEn: 'Nha Trang coast',
    },
    {
      src: commonsFile('Nha trang beach.jpg'),
      altVi: 'Bãi biển Nha Trang',
      altEn: 'Nha Trang beach',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Nha_trang_beach.jpg',
    },
    {
      src: commonsFile('Nha Trang Beach 1.jpg'),
      altVi: 'Bờ biển Nha Trang nhìn ra vịnh',
      altEn: 'Nha Trang beachfront and bay',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Nha_Trang_Beach_1.jpg',
    },
  ],
  'phu-quoc-dao-ngoc-lan-ngam-san-ho': [
    {
      src: '/tour-phu-quoc.jpg',
      altVi: 'Biển Phú Quốc',
      altEn: 'Phu Quoc coast',
    },
    {
      src: commonsFile('Phu Quoc Beach.jpg'),
      altVi: 'Bãi biển trên đảo Phú Quốc',
      altEn: 'Beach on Phu Quoc Island',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Phu_Quoc_Beach.jpg',
    },
    {
      src: commonsFile('Phu quoc plage.jpg'),
      altVi: 'Bờ biển nhiệt đới Phú Quốc',
      altEn: 'Tropical shoreline in Phu Quoc',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Phu_quoc_plage.jpg',
    },
  ],
  'can-tho-cho-noi-cai-rang-miet-vuon': [
    {
      src: '/tour-can-tho.jpg',
      altVi: 'Sông nước Cần Thơ',
      altEn: 'Can Tho river scenery',
    },
    {
      src: commonsFile('Cai Rang floating market, Can Tho (46061353692).jpg'),
      altVi: 'Chợ nổi Cái Răng lúc sáng sớm',
      altEn: 'Cai Rang floating market in the early morning',
      credit: 'Wikimedia Commons',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Cai_Rang_floating_market,_Can_Tho_(46061353692).jpg',
    },
    {
      src: commonsFile('Floating Market Can Tho1.jpg'),
      altVi: 'Thuyền buôn trên chợ nổi Cái Răng',
      altEn: 'Trading boats at Cai Rang floating market',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Floating_Market_Can_Tho1.jpg',
    },
  ],
  'tay-ninh-nui-ba-den-toa-thanh': [
    {
      src: '/tour-tay-ninh.jpg',
      altVi: 'Núi Bà Đen Tây Ninh',
      altEn: 'Ba Den Mountain in Tay Ninh',
    },
    {
      src: commonsFile('Ba Den Mountain summit temple illuminated night fog Tay Ninh Vietnam.jpg'),
      altVi: 'Quần thể trên đỉnh Núi Bà Đen giữa mây',
      altEn: 'Ba Den Mountain summit complex above the clouds',
      credit: 'Wikimedia Commons',
      sourceUrl:
        'https://commons.wikimedia.org/wiki/File:Ba_Den_Mountain_summit_temple_illuminated_night_fog_Tay_Ninh_Vietnam.jpg',
    },
    {
      src: commonsFile('Cao dai temple tay ninh vietnam.JPG'),
      altVi: 'Không gian Tòa Thánh Cao Đài Tây Ninh',
      altEn: 'Cao Dai Temple in Tay Ninh',
      credit: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Cao_dai_temple_tay_ninh_vietnam.JPG',
    },
  ],
};

export function getTourGallery(
  tour: Tour | {
    slug?: string;
    destination?: string;
    imageUrl?: string | null;
    galleryImages?: unknown;
  },
): TourGalleryImage[] {
  if (
    'galleryImages' in tour &&
    Array.isArray(tour.galleryImages) &&
    tour.galleryImages.length > 0
  ) {
    return tour.galleryImages
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .map((src, index) => ({
        src,
        altVi: `Ảnh chi tiết ${index + 1} của ${tour.destination || 'tour'}`,
        altEn: `Tour detail image ${index + 1} for ${tour.destination || 'destination'}`,
      }));
  }

  const gallery = tour.slug ? TOUR_GALLERIES[tour.slug] : undefined;
  return gallery?.length ? gallery : [];
}

// Luxury editorial taglines for each destination
export const TOUR_LUXURY_TAGS: Record<string, string> = {
  'vinh-ha-long-du-thuyen-kayak': 'KỲ QUAN DI SẢN THẾ GIỚI',
  'sa-pa-chinh-phuc-fansipan-cat-cat': 'CHINH PHỤC ĐỈNH ĐÔNG DƯƠNG',
  'ninh-binh-trang-an-bai-dinh-hang-mua': 'TUYỆT TÁC NON NƯỚC TRÀNG AN',
  'da-nang-hoi-an-ba-na-hills-cau-vang': 'DI SẢN & BIỂU TƯỢNG CẦU VÀNG',
  'hue-co-do-dai-noi-ca-hue-song-huong': 'HOÀNG TRIỀU CỐ ĐÔ LINH THIÊNG',
  'nha-trang-bien-xanh-dao-diep-son': 'VỊNH NGỌC BÍCH & CON ĐƯỜNG BIỂN',
  'phu-quoc-dao-ngoc-lan-ngam-san-ho': 'THIÊN ĐƯỜNG ĐẢO NGỌC THƯỢNG LƯU',
  'can-tho-cho-noi-cai-rang-miet-vuon': 'PHONG VỊ MIỆT VƯỜN SÔNG NƯỚC',
  'tay-ninh-nui-ba-den-toa-thanh': 'ĐỈNH THIÊNG MÂY NGÀN TÂY NINH',
};

export const TOUR_LUXURY_TAGS_EN: Record<string, string> = {
  'vinh-ha-long-du-thuyen-kayak': 'WORLD HERITAGE WONDER',
  'sa-pa-chinh-phuc-fansipan-cat-cat': 'ROOF OF INDOCHINA CONQUEST',
  'ninh-binh-trang-an-bai-dinh-hang-mua': 'TRANG AN SCENIC MASTERPIECE',
  'da-nang-hoi-an-ba-na-hills-cau-vang': 'GOLDEN BRIDGE & ANCIENT TOWN',
  'hue-co-do-dai-noi-ca-hue-song-huong': 'IMPERIAL DYNASTY HERITAGE',
  'nha-trang-bien-xanh-dao-diep-son': 'TURQUOISE BAY & OCEAN TRAIL',
  'phu-quoc-dao-ngoc-lan-ngam-san-ho': 'TROPICAL EMERALD SANCTUARY',
  'can-tho-cho-noi-cai-rang-miet-vuon': 'MEKONG RIVERWAYS & ORCHARDS',
  'tay-ninh-nui-ba-den-toa-thanh': 'SACRED CLOUD SUMMIT TAY NINH',
};

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  meals?: string | null;
  stay?: string | null;
  imageUrl?: string | null;
}

export const TOUR_ITINERARIES: Record<string, ItineraryDay[]> = {
  'da-nang-hoi-an-ba-na-hills-cau-vang': [
    {
      day: 1,
      title: 'Đón sân bay Đà Nẵng – Bán đảo Sơn Trà – Chùa Linh Ứng – Biển Mỹ Khê',
      activities: [
        'Xe và Hướng dẫn viên đón Quý khách tại sân bay Đà Nẵng, đưa về khách sạn nhận phòng nghỉ ngơi.',
        'Khởi hành tham quan Bán đảo Sơn Trà, viếng Chùa Linh Ứng Bãi Bụt chiêm bái tượng Phật Bà Quan Âm cao 67m hướng ra biển Đông.',
        'Tự do tắm biển Mỹ Khê – một trong sáu bãi biển quyến rũ nhất hành tinh do tạp chí Forbes bình chọn.',
        'Tối: Thưởng thức đặc sản Bánh tráng cuốn thịt heo hai đầu da, ngắm Cầu Rồng phun lửa và phun nước (vào tối cuối tuần).',
      ],
      meals: 'Trưa, Tối',
      stay: 'Khách sạn 4-5 sao trung tâm biển Mỹ Khê',
    },
    {
      day: 2,
      title: 'Bà Nà Hills – Check-in Cầu Vàng Bàn Tay Khổng Lồ – Làng Pháp',
      activities: [
        'Khởi hành đến Sun World Ba Na Hills, trải nghiệm tuyến cáp treo đạt kỷ lục thế giới ngắm toàn cảnh rừng nguyên sinh bạt ngàn.',
        'Sải bước trên Cầu Vàng (Golden Bridge) – kiệt tác kiến trúc uốn lượn được nâng đỡ bởi đôi bàn tay rêu phong giữa biển mây.',
        "Tham quan Hầm rượu Debay trăm tuổi, Vườn hoa Le Jardin D'Amour lãng mạn phong cách Pháp.",
        'Thỏa sức vui chơi không giới hạn tại công viên giải trí trong nhà Fantasy Park đẳng cấp quốc tế.',
        'Chiều: Trở về lại trung tâm Đà Nẵng, tự do dạo phố đêm sông Hàn.',
      ],
      meals: 'Sáng, Trưa buffet tại Bà Nà, Tối',
      stay: 'Khách sạn 4-5 sao Đà Nẵng',
    },
    {
      day: 3,
      title: 'Đô Thị Cổ Hội An – Du Thuyền Sông Hoài Thả Hoa Đăng',
      activities: [
        'Buổi sáng: Thư giãn tại hồ bơi vô cực hoặc tự do tắm biển Mỹ Khê.',
        'Chiều: Di chuyển đến Đô thị cổ Hội An – Di sản Văn hóa Thế giới UNESCO.',
        'Bách bộ chiêm ngưỡng Chùa Cầu Nhật Bản cổ kính, Hội quán Phúc Kiến, Nhà cổ Phùng Hưng giao thoa kiến trúc 3 nền văn hóa.',
        'Trải nghiệm đi thuyền gỗ trên dòng sông Hoài, tự tay thả hoa đăng lung linh cầu chúc an lành giữa muôn sắc đèn lồng phố cổ.',
        'Thưởng thức các món ngon trứ danh Xứ Quảng: Cao lầu, Mì Quảng, Cơm gà bà Buội, bánh bao bánh vạc.',
      ],
      meals: 'Sáng, Trưa, Tối',
      stay: 'Khách sạn 4-5 sao Đà Nẵng / Resort Hội An',
    },
    {
      day: 4,
      title: 'Danh Thắng Ngũ Hành Sơn – Làng Đá Non Nước – Mua Sắm – Tiễn Khách',
      activities: [
        'Khám phá danh thắng Ngũ Hành Sơn: chinh phục ngọn Thủy Sơn, vãn cảnh động Huyền Không, động Tàng Chơn huyền ảo.',
        'Ghé thăm Làng điêu khắc đá mỹ nghệ Non Nước với lịch sử hơn 300 năm hình thành và phát triển.',
        'Tham quan và mua sắm quà lưu niệm, hải sản một nắng, chả bò Đà Nẵng tại Chợ Cồn hoặc Chợ Hàn.',
        'Xe tiễn Quý khách ra sân bay Đà Nẵng làm thủ tục chuyến bay về. Kết thúc chuyến đi đầy kỷ niệm.',
      ],
      meals: 'Sáng, Trưa',
      stay: 'Kết thúc chuyến hành trình',
    },
  ],

  'vinh-ha-long-du-thuyen-kayak': [
    {
      day: 1,
      title: 'Hà Nội – Cảng Tuần Châu – Du Thuyền Vịnh Hạ Long – Chèo Kayak',
      activities: [
        'Xe Limousine hạng thương gia đón Quý khách tại Hà Nội, khởi hành đi Tuần Châu qua cao tốc hiện đại.',
        'Lên du thuyền 5 sao sang trọng, thưởng thức đồ uống chào mừng và nghe tóm tắt hành trình.',
        'Ăn trưa hải sản tươi sống trong khi du thuyền lướt qua hàng nghìn đảo đá vôi kỳ vĩ: hòn Đỉnh Hương, hòn Chó Đá, hòn Gà Chọi.',
        'Khám phá Hang Luồn bằng thuyền nan hoặc tự do chèo thuyền kayak lướt trên làn nước xanh ngọc bích.',
        'Tắm biển tại đảo Ti Tốp, leo lên đỉnh núi ngắm toàn cảnh vịnh kỳ quan 360 độ.',
        'Tối: Tham gia tiệc trà Sunset Party trên boong tàu, trải nghiệm câu mực đêm và thư giãn ngắm sao.',
      ],
      meals: 'Trưa hải sản, Tiệc chiều Sunset, Tối phong vị Á - Âu',
      stay: 'Phòng Suite ban công riêng trên du thuyền 5 sao',
    },
    {
      day: 2,
      title: 'Hang Sửng Sốt – Lớp Học Nấu Ăn – Về Lại Hà Nội',
      activities: [
        'Đón bình minh trên vịnh biển, tham gia lớp tập Thái Cực Quyền (Tai Chi) nhẹ nhàng trên Sundeck.',
        'Khám phá Hang Sửng Sốt – một trong những hang động đẹp và rộng lớn nhất Vịnh Hạ Long với vô vàn nhũ đá lung linh.',
        'Trở về du thuyền làm thủ tục trả phòng, tham gia lớp hướng dẫn làm nem cuốn truyền thống Việt Nam.',
        'Thưởng thức bữa trưa buffet sớm trong khi tàu nhẹ nhàng quay về bến cảng Tuần Châu.',
        'Xe đón Quý khách đưa về lại điểm đón ban đầu tại Hà Nội. Kết thúc hành trình trọn vẹn.',
      ],
      meals: 'Sáng nhẹ, Trưa buffet trên tàu',
      stay: 'Kết thúc chuyến hành trình',
    },
  ],

  'sa-pa-chinh-phuc-fansipan-cat-cat': [
    {
      day: 1,
      title: "Hà Nội – Sa Pa – Khám Phá Bản Cát Cát Của Người H'Mông",
      activities: [
        'Xe limousine đón Quý khách khởi hành đi Sa Pa theo cao tốc Nội Bài – Lào Cai ngắm cảnh núi non Tây Bắc.',
        'Đến thị trấn Sa Pa mù sương, dùng bữa trưa đặc sản vùng cao và nhận phòng khách sạn nghỉ ngơi.',
        "Bách bộ khám phá Bản Cát Cát: tìm hiểu nghề dệt thổ cẩm, rèn bạc truyền thống của người H'Mông, chụp ảnh bên Thác Tiên Sa.",
        'Tối: Thưởng thức đặc sản lẩu cá hồi, cá tầm tươi sống Sa Pa. Tự do dạo Chợ đêm Sa Pa và Nhà thờ Đá cổ.',
      ],
      meals: 'Trưa, Tối lẩu cá hồi',
      stay: 'Khách sạn / Resort 4 sao trung tâm Sa Pa',
    },
    {
      day: 2,
      title: 'Chinh Phục Đỉnh Fansipan 3.143m – Thung Lũng Mường Hoa',
      activities: [
        'Khởi hành đi ga cáp treo Fansipan Legend, trải nghiệm tàu hỏa leo núi Mường Hoa băng qua thung lũng tuyệt đẹp.',
        'Đi tuyến cáp treo 3 dây lên đỉnh Fansipan – Nóc nhà Đông Dương ở độ cao 3.143m.',
        'Chiêm bái quần thể tâm linh trên khu vực đỉnh Fansipan.',
        'Chiều: Trở về trung tâm Sa Pa nghỉ ngơi, không chạy lặp tuyến Quốc lộ 4D trong ngày này.',
      ],
      meals: 'Sáng, Trưa buffet trên Fansipan, Tối',
      stay: 'Khách sạn / Resort 4 sao Sa Pa',
    },
    {
      day: 3,
      title: 'Thác Bạc – Ô Quy Hồ – Cổng Trời – Về Hà Nội',
      activities: [
        'Khởi hành theo cùng trục Quốc lộ 4D, tham quan Thác Bạc.',
        'Tiếp tục đến đèo Ô Quy Hồ và khu vực Cổng Trời, hạn chế việc tách cùng một cung đường sang nhiều ngày.',
        'Trở về Sa Pa dùng bữa trưa, mua đặc sản địa phương nếu còn thời gian.',
        'Lên xe trở về Hà Nội, dự kiến đến nơi vào chiều tối tùy điều kiện giao thông.',
      ],
      meals: 'Sáng, Trưa',
      stay: 'Kết thúc chuyến hành trình',
    },
  ],

  'ninh-binh-trang-an-bai-dinh-hang-mua': [
    {
      day: 1,
      title: 'Hà Nội – Tràng An – Hang Múa – Về Hà Nội',
      activities: [
        '07:00–07:30: Đón khách tại Hà Nội, khởi hành đi Ninh Bình.',
        'Buổi sáng: Đi thuyền tham quan Quần thể danh thắng Tràng An theo tuyến vận hành thực tế trong ngày.',
        'Dùng bữa trưa và có thời gian nghỉ hợp lý trước điểm tham quan buổi chiều.',
        'Buổi chiều: Tham quan Hang Múa, chủ động thời gian leo bậc và ngắm cảnh.',
        'Khoảng cuối buổi chiều: Khởi hành về Hà Nội để tránh nhồi quá nhiều điểm vào tour một ngày.',
        'Chùa Bái Đính được tách khỏi lịch trình tiêu chuẩn này; chỉ bổ sung khi vận hành một sản phẩm riêng có đủ thời gian.',
      ],
      meals: 'Trưa đặc sản dê núi Ninh Bình',
      stay: 'Tour 1 ngày trọn vẹn',
    },
  ],

  'hue-co-do-dai-noi-ca-hue-song-huong': [
    {
      day: 1,
      title: 'Đón khách – Đại Nội Hoàng Cung Triều Nguyễn – Ca Huế Sông Hương',
      activities: [
        'Đón Quý khách tại sân bay Phú Bài hoặc trung tâm Huế, đưa về khách sạn nhận phòng nghỉ ngơi.',
        'Khám phá Đại Nội Kinh Thành Huế: Ngọ Môn, Điện Thái Hòa, Tử Cấm Thành – nơi ngự trị của 13 vị vua triều Nguyễn.',
        'Viếng Chùa Thiên Mụ cổ kính soi bóng bên dòng sông Hương thơ mộng, chiêm bái tháp Phước Duyên 7 tầng.',
        'Tối: Thưởng thức bữa tối ẩm thực cung đình Huế. Lên thuyền rồng nghe Ca Huế và tự tay thả hoa đăng trên sông Hương.',
      ],
      meals: 'Trưa, Tối ẩm thực cung đình',
      stay: 'Khách sạn 4 sao ven sông Hương',
    },
    {
      day: 2,
      title: 'Lăng Khải Định – Lăng Tự Đức – Làng Hương Thủy Xuân – Tiễn Khách',
      activities: [
        'Tham quan Lăng Khải Định – kiệt tác nghệ thuật kiến trúc kết hợp tinh hoa Đông – Tây độc nhất vô nhị.',
        'Chiêm ngưỡng Lăng Tự Đức mang vẻ đẹp hữu tình, tao nhã như một bức tranh thủy mặc.',
        'Check-in tại Làng hương Thủy Xuân rực rỡ sắc màu, thử tài se hương trầm truyền thống xứ Huế.',
        'Thưởng thức các món bánh cung đình: bánh bèo, nậm, lọc, ram ít. Tiễn Quý khách ra sân bay.',
      ],
      meals: 'Sáng, Trưa đặc sản Huế',
      stay: 'Kết thúc chuyến hành trình',
    },
  ],

  'nha-trang-bien-xanh-dao-diep-son': [
    {
      day: 1,
      title: 'Đón sân bay Cam Ranh – Check-in Resort – Tắm Biển Trần Phú',
      activities: [
        'Xe đón Quý khách tại sân bay Cam Ranh trên cung đường biển tuyệt đẹp về trung tâm thành phố Nha Trang.',
        'Nhận phòng khách sạn 5 sao mặt biển nghỉ ngơi, tự do tắm biển và ngắm hoàng hôn vịnh Nha Trang.',
        'Tối: Thưởng thức bữa tối hải sản tươi sống: tôm hùm nướng, mực nang, hàu nướng mỡ hành.',
      ],
      meals: 'Trưa, Tối hải sản',
      stay: 'Khách sạn / Resort 5 sao hướng biển Nha Trang',
    },
    {
      day: 2,
      title: 'Du Ngoạn Đảo Điệp Sơn – Khám Phá Con Đường Đi Bộ Giữa Biển',
      activities: [
        'Cano cao tốc đưa Quý khách đến Đảo Điệp Sơn – nơi nổi tiếng với con đường cát trắng tự nhiên đi bộ xuyên biển độc nhất vô nhị.',
        'Trải nghiệm cảm giác hồi hộp và phấn khích khi bước đi giữa đại dương xanh biếc bao la.',
        'Thư giãn tắm biển nước trong vắt nhìn thấy đáy, chèo SUP chụp hình check-in triệu like.',
        'Chiều: Trải nghiệm dịch vụ tắm bùn khoáng nóng I-Resort phục hồi năng lượng và chăm sóc sức khỏe.',
      ],
      meals: 'Sáng, Trưa hải sản tại đảo, Tối',
      stay: 'Khách sạn / Resort 5 sao Nha Trang',
    },
    {
      day: 3,
      title: 'Tháp Bà Ponagar – Viện Hải Dương Học – Mua Sắm Yến Sào – Tiễn Khách',
      activities: [
        'Tham quan Di tích lịch sử Tháp Bà Ponagar – quần thể đền tháp Chăm Pa cổ kính trên đồi Cù Lao.',
        'Khám phá Viện Hải Dương Học Nha Trang với bộ sưu tập sinh vật biển đồ sộ bậc nhất Đông Nam Á.',
        'Tham quan trung tâm Yến Sào Khánh Hòa, mua đặc sản chả cá, mực rim me làm quà tặng.',
        'Tiễn Quý khách ra sân bay Cam Ranh. Kết thúc kỳ nghỉ dưỡng biển sảng khoái.',
      ],
      meals: 'Sáng, Trưa',
      stay: 'Kết thúc chuyến hành trình',
    },
  ],

  'phu-quoc-dao-ngoc-lan-ngam-san-ho': [
    {
      day: 1,
      title: 'Đón sân bay Phú Quốc – Check-in Resort – Sunset Sanato Ngắm Hoàng Hôn',
      activities: [
        'Xe riêng đón Quý khách tại Cảng hàng không quốc tế Phú Quốc, đưa về resort 5 sao nhận phòng.',
        'Tự do đắm mình trong làn nước biển Bãi Trường hoặc hồ bơi vô cực của khu nghỉ dưỡng.',
        'Buổi chiều: Đến Sunset Sanato Beach Club – địa điểm ngắm hoàng hôn trứ danh với các biểu tượng điêu khắc nghệ thuật bên bờ biển.',
        'Tối: Dùng bữa tại Chợ đêm Phú Quốc, thưởng thức ghẹ Hàm Ninh, nhum biển nướng mỡ hành.',
      ],
      meals: 'Trưa, Tối hải sản',
      stay: 'Resort 5 sao bãi biển Phú Quốc',
    },
    {
      day: 2,
      title: 'Cáp Treo Hòn Thơm Vượt Biển – Công Viên Nước Aquatopia',
      activities: [
        'Trải nghiệm cáp treo Hòn Thơm 3 dây vượt biển dài nhất thế giới (7.899m) ngắm nhìn toàn cảnh quần đảo An Thới từ trên cao.',
        'Thỏa sức vui chơi tại công viên nước chủ đề Aquatopia Water Park với hơn 20 trò chơi cảm giác mạnh hiện đại.',
        'Tắm biển tại bãi Trào cát trắng mịn màng như kem, rợp bóng rặng dừa xanh ngát.',
        'Chiều: Trở về khách sạn, tự do thư giãn liệu trình Spa cao cấp tại resort.',
      ],
      meals: 'Sáng, Trưa buffet Hòn Thơm, Tối',
      stay: 'Resort 5 sao Phú Quốc',
    },
    {
      day: 3,
      title: 'Cano Khám Phá 4 Đảo Hoang Sơ – Lặn Ngắm San Hô – Grand World',
      activities: [
        'Lên cano siêu tốc rẽ sóng khám phá 4 hòn đảo đẹp nhất: Hòn Mây Rút Trong, Hòn Mây Rút Ngoài, Hòn Gầm Ghì, Hòn Móng Tay.',
        'Trải nghiệm lặn ngắm rạn san hô tự nhiên rực rỡ sắc màu bằng ống thở hoặc đi bộ dưới đáy biển.',
        'Tặng bộ ảnh & video Flycam chụp riêng chuyên nghiệp trên bãi biển hoang sơ.',
        'Chiều tối: Ghé thăm Grand World – "Thành phố không ngủ", đi thuyền Gondola trên kênh đào Venice thu nhỏ, thưởng thức show diễn thực cảnh "Tinh hoa Việt Nam".',
      ],
      meals: 'Sáng, Trưa trên đảo, Tối',
      stay: 'Resort 5 sao Phú Quốc',
    },
    {
      day: 4,
      title: 'Trang Trại Ngọc Trai – Vườn Tiêu – Nhà Thùng Nước Mắm – Tiễn Sân Bay',
      activities: [
        'Tham quan trung tâm cấy ngọc trai cao cấp Phú Quốc, tìm hiểu quy trình nuôi cấy trai lấy ngọc.',
        'Ghé thăm Vườn tiêu Suối Đá và Nhà thùng nước mắm truyền thống lâu đời trên đảo.',
        'Tự do thư giãn buổi sáng, làm thủ tục trả phòng resort.',
        'Xe tiễn Quý khách ra sân bay Phú Quốc, kết thúc chuyến nghỉ dưỡng đẳng cấp.',
      ],
      meals: 'Sáng, Trưa nhẹ',
      stay: 'Kết thúc chuyến hành trình',
    },
  ],

  'can-tho-cho-noi-cai-rang-miet-vuon': [
    {
      day: 1,
      title: 'TP.HCM – Cần Thơ – Nhà Cổ Bình Thủy – Bến Ninh Kiều Về Đêm',
      activities: [
        'Xe đón Quý khách tại TP.HCM khởi hành xuôi về miền Tây sông nước Cần Thơ qua cầu Mỹ Thuận hùng vĩ.',
        'Tham quan Nhà cổ Bình Thủy – ngôi nhà cổ hơn 150 năm tuổi với lối kiến trúc Đông Dương độc đáo từng là bối cảnh phim "Người tình".',
        'Nhận phòng khách sạn 4-5 sao trung tâm Cần Thơ, thưởng thức bữa trưa với món Cá lóc nướng trui, lẩu mắm miền Tây.',
        'Tối: Dạo bến Ninh Kiều, đi du thuyền ngắm sông Hậu lung linh ánh đèn và lắng nghe giai điệu Đờn ca tài tử Nam Bộ.',
      ],
      meals: 'Trưa, Tối trên du thuyền sông Hậu',
      stay: 'Khách sạn 4-5 sao Cần Thơ',
    },
    {
      day: 2,
      title: 'Chợ Nổi Cái Răng Buổi Sớm – Miệt Vườn Trái Cây Phong Điền – TP.HCM',
      activities: [
        '05:30: Lên thuyền đón bình minh, khám phá Chợ nổi Cái Răng – nét văn hóa thương hồ đặc sắc nhất Đồng bằng sông Cửu Long.',
        'Thưởng thức tô hủ tiếu nóng hổi và ly cà phê sữa đá đậm đà ngay trên thuyền chao nghiêng theo từng con sóng.',
        'Ghé thăm lò hủ tiếu truyền thống, thử tài tự tay tráng bánh hủ tiếu ngũ sắc.',
        'Vào miệt vườn trái cây Phong Điền: tự tay hái và thưởng thức chôm chôm, măng cụt, sầu riêng chín cây ngọt lịm.',
        'Ăn trưa với món Gà thả vườn nướng đất sét. Chiều xe đưa Quý khách về lại TP.HCM.',
      ],
      meals: 'Sáng trên chợ nổi, Trưa miệt vườn',
      stay: 'Kết thúc chuyến hành trình',
    },
  ],

  'tay-ninh-nui-ba-den-toa-thanh': [
    {
      day: 1,
      title: 'TP.HCM – Chinh Phục Núi Bà Đen – Tòa Thánh Tây Ninh',
      activities: [
        '06:30: Xe Limousine đón Quý khách tại TP.HCM khởi hành đi Tây Ninh.',
        'Thưởng thức bữa sáng đặc sản Bánh canh Trảng Bàng nức tiếng thơm ngon.',
        'Đến Quần thể du lịch Sun World Ba Den Mountain: đi tuyến cáp treo Vân Sơn hiện đại lên đỉnh núi Bà Đen ở độ cao 986m.',
        'Chiêm bái Đại tượng Phật Bà Tây Bổ Đà Sơn bằng đồng nguyên khối cao nhất Châu Á ngự trên đỉnh núi thiêng quanh năm mây phủ.',
        'Thưởng thức bữa trưa buffet hơn 80 món tại nhà hàng Vân Sơn trên đỉnh núi.',
        'Chiều: Tham quan Tòa Thánh Tây Ninh – thánh địa tôn giáo Cao Đài lộng lẫy với phong cách kiến trúc độc nhất vô nhị.',
        'Mua sắm đặc sản: Bánh tráng phơi sương Trảng Bàng, muối tôm Tây Ninh chính gốc.',
        '17:30: Khởi hành về lại TP.HCM. Kết thúc chuyến hành hương và chiêm bái trọn vẹn.',
      ],
      meals: 'Sáng bánh canh Trảng Bàng, Trưa buffet đỉnh núi',
      stay: 'Tour 1 ngày trọn vẹn',
    },
  ],

  'phu-quy-hon-dao-nho-nen-tho': [
    {
      day: 1,
      title: 'TP.HCM – Phan Thiết – Tàu Cao Tốc Ra Đảo Phú Quý',
      activities: [
        'Di chuyển bằng ô tô từ TP.HCM đến cảng Phan Thiết.',
        'Làm thủ tục và đi tàu cao tốc Phan Thiết – Phú Quý; tuyệt đối không mô tả chặng ra đảo bằng ô tô.',
        'Nhận phòng sau khi tàu cập đảo, nghỉ ngơi và tham quan các điểm gần theo điều kiện thực tế.',
        'Giờ tàu có thể điều chỉnh hoặc chuyến có thể tạm ngừng khi thời tiết, sóng gió hoặc cơ quan vận hành không cho phép chạy.',
      ],
      meals: 'Theo gói dịch vụ đã công bố',
      stay: 'Cơ sở lưu trú trên đảo Phú Quý',
    },
    {
      day: 2,
      title: 'Khám Phá Đảo Phú Quý – Tàu Cao Tốc Về Phan Thiết',
      activities: [
        'Tham quan các điểm phù hợp trên đảo theo khung giờ tàu về.',
        'Trả phòng và có mặt tại cảng đúng thời gian làm thủ tục.',
        'Đi tàu cao tốc Phú Quý – Phan Thiết.',
        'Tiếp tục di chuyển bằng ô tô từ Phan Thiết về TP.HCM.',
      ],
      meals: 'Theo gói dịch vụ đã công bố',
      stay: 'Kết thúc hành trình',
    },
  ],
};

export const TOUR_ITINERARIES_EN: Record<string, ItineraryDay[]> = {
  'da-nang-hoi-an-ba-na-hills-cau-vang': [
    {
      day: 1,
      title: 'Da Nang Arrival – Son Tra Peninsula – Linh Ung Pagoda – My Khe Beach',
      activities: [
        'Airport greeting by private chauffeur and tour escort, transfer to beachfront luxury hotel.',
        'Explore Son Tra Peninsula, visit Linh Ung Pagoda and admire the 67m Lady Buddha statue overlooking the East Sea.',
        "Unwind on My Khe Beach – acclaimed as one of the world's most glamorous coastlines by Forbes.",
        'Evening: Taste Central specialty pork rice paper rolls; witness the iconic Dragon Bridge fire & water show.',
      ],
      meals: 'Lunch, Dinner',
      stay: '4-5 Star Beachfront Hotel Da Nang',
    },
    {
      day: 2,
      title: 'Ba Na Hills – Iconic Golden Bridge – French Village',
      activities: [
        'Ascend to Sun World Ba Na Hills via world-record cable car over primordial jungle canopies.',
        'Stroll across the world-famous Golden Bridge cupped by giant moss-clad hands above floating clouds.',
        "Tour the century-old Debay Wine Cellar and romantic French-styled Le Jardin D'Amour floral gardens.",
        'Enjoy unlimited thrills at Fantasy Park indoor recreation kingdom.',
        'Evening: Return to Da Nang city center; leisurely stroll along the Han River esplanade.',
      ],
      meals: 'Breakfast, Gourmet Buffet at Ba Na, Dinner',
      stay: '4-5 Star Hotel Da Nang',
    },
    {
      day: 3,
      title: 'Marble Mountains – Ancient Town Hoi An – Lantern Riverboat',
      activities: [
        'Discover Marble Mountains (Ngu Hanh Son), Am Phu Cave, and stone carving heritage village.',
        'Arrive at UNESCO World Heritage Hoi An Ancient Town; explore the Japanese Covered Bridge and Tan Ky Old House.',
        'Relish authentic Hoi An delicacies: Cao Lau, White Rose dumplings, and Phuong Banh Mi.',
        'Dusk: Cruise the Hoai River on a wooden boat to release illuminated flower candles.',
      ],
      meals: 'Breakfast, Lunch, Dinner',
      stay: '4-5 Star Boutique Resort Hoi An',
    },
    {
      day: 4,
      title: 'Cam Thanh Coconut Palm Jungle – Local Souvenir Shopping – Departure',
      activities: [
        'Navigate through Cam Thanh water coconut grove aboard traditional round basket boats with spinning boat masters.',
        'Shop for tailored silk fashion, handicraft lanterns, and Danang specialty dried seafood.',
        'Hotel check-out; private transfer to Da Nang International Airport for return flight.',
      ],
      meals: 'Breakfast, Lunch',
      stay: 'Tour concludes with lasting memories',
    },
  ],
  'vinh-ha-long-du-thuyen-kayak': [
    {
      day: 1,
      title: 'Hanoi – Tuan Chau Marina – Ha Long Luxury Cruise – Sung Sot Grotto',
      activities: [
        'Private limousine departure from Hanoi along modern expressway to Tuan Chau Port.',
        "Board 5-star luxury cruise, enjoy welcome champagne and chef's seafood lunch while sailing past thousand karst peaks.",
        'Explore Sung Sot (Surprise) Cave – the most expansive and awe-inspiring stalactite cavern in Ha Long Bay.',
        "Sunset: Attend Captain's Sundowner Cocktail Party on upper deck with live acoustic music.",
      ],
      meals: 'Lunch, Dinner',
      stay: '5-Star Luxury Ocean Cabin Cruise Ha Long',
    },
    {
      day: 2,
      title: 'Luon Grotto Kayaking – Ti Top Beach Summit – Hanoi Return',
      activities: [
        'Early morning Tai Chi session on sundeck at dawn amidst misty karst towers.',
        'Paddle kayak or wooden bamboo boat through Luon Grotto into a secluded tranquil emerald lagoon.',
        'Ascend Ti Top Island summit for an unrivaled 360-degree panoramic view of the world natural wonder.',
        'Brunch buffet aboard while cruising back to port; private transfer returning to Hanoi.',
      ],
      meals: 'Breakfast, Brunch',
      stay: 'Tour concludes warmly',
    },
  ],
  'sa-pa-chinh-phuc-fansipan-cat-cat': [
    {
      day: 1,
      title: "Hanoi – Sa Pa Mountain Retreat – Cat Cat H'Mong Village",
      activities: [
        'Limousine ascent along Noi Bai - Lao Cai scenic highway to the misty highland paradise of Sa Pa.',
        'Check-in to mountain-view resort; savor northwestern mountain delicacies including black chicken and wild mushrooms.',
        "Hike through terraced rice fields to Cat Cat Village; discover H'mong weaving crafts and Tien Sa Waterfall.",
        'Evening: Discover Sa Pa Stone Church and bustling highland ethnic night market.',
      ],
      meals: 'Lunch, Dinner',
      stay: '4-5 Star Mountain Resort Sa Pa',
    },
    {
      day: 2,
      title: 'Fansipan Peak (3,143m) – Roof of Indochina',
      activities: [
        'Board the Fansipan cable-car system above Muong Hoa Valley.',
        'Visit the 3,143m Fansipan summit area and its spiritual complex.',
        'Return to central Sa Pa in the afternoon instead of repeating the National Route 4D corridor.',
        'Evening leisure in Sa Pa.',
      ],
      meals: 'Breakfast, Lunch, Dinner',
      stay: '4-5 Star Resort Sa Pa',
    },
    {
      day: 3,
      title: 'Silver Waterfall – O Quy Ho Pass – Heaven Gate – Departure',
      activities: [
        'Follow one National Route 4D corridor to Silver Waterfall.',
        'Continue to O Quy Ho Pass and the Heaven Gate viewpoint on the same excursion.',
        'Return to Sa Pa for lunch and optional local shopping if time permits.',
        'Depart for Hanoi in the afternoon; arrival time depends on traffic conditions.',
      ],
      meals: 'Breakfast, Lunch',
      stay: 'Tour concludes',
    },
  ],
  'ninh-binh-trang-an-bai-dinh-hang-mua': [
    {
      day: 1,
      title: 'Hanoi – Trang An – Hang Mua – Return to Hanoi',
      activities: [
        'Depart Hanoi around 07:00–07:30 for Ninh Binh.',
        'Morning sampan excursion through the Trang An scenic complex.',
        'Lunch and a reasonable rest period before the afternoon visit.',
        'Visit Hang Mua with enough time for the staircase and panoramic viewpoint.',
        'Leave Ninh Binh in the late afternoon for Hanoi.',
        'Bai Dinh is intentionally excluded from this standard day trip and should be sold as a separate itinerary when enough time is allocated.',
      ],
      meals: 'Lunch',
      stay: 'Day trip concludes',
    },
  ],
  'hue-co-do-dai-noi-ca-hue-song-huong': [
    {
      day: 1,
      title:
        'Hue Arrival – Imperial Citadel Forbidden Purple City – Thien Mu Pagoda – Perfume River Serenades',
      activities: [
        'Welcome greeting in Hue; check-in to heritage riverside hotel.',
        'Step back in time at the Hue Imperial Citadel, Ngo Mon Gate, Thai Hoa Palace, and Forbidden Purple City.',
        'Visit the ancient Thien Mu Pagoda with Phuoc Duyen tower standing serenely on the riverbank.',
        'Evening: Royal dragon boat cruise on Perfume River, listening to traditional Ca Hue folk songs and floating candles.',
      ],
      meals: 'Lunch, Royal Court Dinner',
      stay: '4-5 Star Heritage Hotel Hue',
    },
    {
      day: 2,
      title: 'Khai Dinh & Tu Duc Royal Tombs – Dong Ba Market – Farewell',
      activities: [
        'Tour Khai Dinh Tomb – a masterwork fusing Vietnamese and European architectural artistry with porcelain mosaics.',
        'Visit poetic Tu Duc Tomb nestled amongst pine forests and lotus lakes.',
        'Shop for conical poem hats (Non La), royal herbal tea, and sesame candy at Dong Ba Market.',
        'Private airport transfer for return flight.',
      ],
      meals: 'Breakfast, Lunch',
      stay: 'Tour concludes',
    },
  ],
  'nha-trang-bien-xanh-dao-diep-son': [
    {
      day: 1,
      title: 'Nha Trang Bay Arrival – Po Nagar Cham Towers – Ocean Sunset',
      activities: [
        'Pick-up at Cam Ranh International Airport, transfer along the coastal highway to Nha Trang city.',
        'Explore sacred 8th-century Po Nagar Cham Towers honoring the mother goddess Yan Po Nagar.',
        'Rejuvenate at natural I-Resort hot mineral mud baths.',
        'Evening: Seafood feast along Tran Phu boulevard; explore Nha Trang night market.',
      ],
      meals: 'Lunch, Dinner',
      stay: '4-5 Star Luxury Coastal Hotel Nha Trang',
    },
    {
      day: 2,
      title: 'Diep Son Island Sandbar Expedition – Mun Island Snorkeling',
      activities: [
        'Speedboat to Diep Son Island; experience walking across the open turquoise sea along the natural submerged sandbar.',
        'Snorkel at Hon Mun Marine Protected Area observing kaleidoscopic coral beds and tropical fish.',
        'Seafood BBQ lunch served on a floating island raft.',
        'Evening: Relax at beachfront lounge with tropical cocktails.',
      ],
      meals: 'Breakfast, Lunch, Dinner',
      stay: '4-5 Star Hotel Nha Trang',
    },
    {
      day: 3,
      title: 'Long Son Pagoda – Dam Market Souvenirs – Departure',
      activities: [
        'Visit Long Son Pagoda to admire the giant white Buddha statue overlooking the coast.',
        "Purchase dried squids, bird's nest tonic, and roasted cashew nuts at Dam Market.",
        'Transfer to Cam Ranh airport for return flight.',
      ],
      meals: 'Breakfast, Lunch',
      stay: 'Tour concludes',
    },
  ],
  'phu-quoc-dao-ngoc-lan-ngam-san-ho': [
    {
      day: 1,
      title: 'Emerald Island Arrival – Grand World Sleepless City – Venice Canal',
      activities: [
        'Welcome at Phu Quoc International Airport, transfer to luxury seaside resort.',
        'Discover Grand World – the sleepless entertainment hub with gondola rides along the replica Venice Canal.',
        'Watch the spectacular "Colors of Venice" multimedia water and laser show.',
        'Evening: Savor sea urchin, flower crab, and fresh herring salad at Phu Quoc night market.',
      ],
      meals: 'Lunch, Dinner',
      stay: '5-Star Beach Resort Phu Quoc',
    },
    {
      day: 2,
      title: 'Hon Thom Longest Sea Cable Car – 4-Islands Coral Safari',
      activities: [
        "Ride the world's longest 3-wire sea-crossing cable car (7,899m) to Hon Thom Nature Park and Aquatopia.",
        'Private canoe island-hopping through An Thoi archipelago: Hon May Rut, Hon Gam Ghi, and Hon Mong Tay.',
        'SUP paddle boarding, flycam aerial photo session, and snorkeling among vibrant coral reefs.',
        'Sunset cocktail at Sunset Sanato admiring artistic beachfront sculptures.',
      ],
      meals: 'Breakfast, Seafood Lunch on Island, Dinner',
      stay: '5-Star Resort Phu Quoc',
    },
    {
      day: 3,
      title: 'Pepper Farm & Pearl Farm – Sunset Sea Safari – Departure',
      activities: [
        'Visit Phu Quoc pearl cultivation farm and organic black pepper plantation.',
        'Buy authentic Phu Quoc fish sauce and Sim fruit wine as premium gifts.',
        'Check-out and private transfer to Phu Quoc Airport.',
      ],
      meals: 'Breakfast, Lunch',
      stay: 'Tour concludes',
    },
  ],
  'can-tho-cho-noi-cai-rang-miet-vuon': [
    {
      day: 1,
      title: 'Ho Chi Minh City – Can Tho – Binh Thuy Heritage Mansion – Ninh Kieu Wharf',
      activities: [
        'Scenic morning drive across Mekong Delta via My Thuan Bridge to Can Tho.',
        'Visit historic Binh Thuy French-Vietnamese Mansion, the famous film setting for "The Lover".',
        'Board river cruise at Ninh Kieu Wharf for dinner while listening to Southern Don Ca Tai Tu music.',
        'Evening: Stroll across Can Tho pedestrian love bridge and night food stalls.',
      ],
      meals: 'Lunch, Dinner',
      stay: '4-5 Star Riverside Hotel Can Tho',
    },
    {
      day: 2,
      title: 'Dawn Cai Rang Floating Market – Phong Dien Tropical Orchard – Return',
      activities: [
        '5:30 AM sunrise boat trip to bustling Cai Rang floating market, tasting hot Hu Tieu noodle soup on water.',
        'Visit traditional noodle-making workshop and Phong Dien fruit orchard with rambutan, durian, and mangosteen.',
        'Savor traditional clay-baked snakehead fish and sizzling banh xeo crepes.',
        'Return journey to Ho Chi Minh City.',
      ],
      meals: 'Breakfast, Lunch',
      stay: 'Tour concludes',
    },
  ],
  'tay-ninh-nui-ba-den-toa-thanh': [
    {
      day: 1,
      title: 'Ho Chi Minh City – Mount Ba Den Cloud Summit – Holy Cao Dai Sanctuary',
      activities: [
        'Early departure from Saigon towards the sunlit borders of Tay Ninh province.',
        'Ride the world-record Sun World cable car ascending to the 986m misty summit of Mount Ba Den.',
        "Venerate Asia's tallest bronze Lady Buddha statue (Tay Bo Da Son) amidst spectacular mountain clouds.",
        'Savor an expansive vegetarian and regional buffet at Van Son restaurant.',
        'Afternoon: Visit Tay Ninh Holy See – the world headquarters of Cao Dai religion with magnificent dragon pillars.',
        'Return to Ho Chi Minh City in late afternoon.',
      ],
      meals: 'Buffet Lunch',
      stay: 'Day trip concludes',
    },
  ],
  'phu-quy-hon-dao-nho-nen-tho': [
    {
      day: 1,
      title: 'Ho Chi Minh City – Phan Thiet – High-Speed Ferry to Phu Quy',
      activities: [
        'Road transfer from Ho Chi Minh City to Phan Thiet port.',
        'Board the high-speed ferry from Phan Thiet to Phu Quy; the sea crossing is not a road-transfer segment.',
        'Check in after arrival and visit nearby island attractions according to actual operating conditions.',
        'Ferry times may change or services may be suspended because of weather, sea state, or operator/authority restrictions.',
      ],
      meals: 'According to the published package',
      stay: 'Accommodation on Phu Quy Island',
    },
    {
      day: 2,
      title: 'Phu Quy Island – High-Speed Ferry to Phan Thiet',
      activities: [
        'Visit suitable island attractions while preserving enough buffer for the return ferry.',
        'Check out and arrive at the port in time for boarding procedures.',
        'Take the high-speed ferry from Phu Quy back to Phan Thiet.',
        'Continue by road from Phan Thiet to Ho Chi Minh City.',
      ],
      meals: 'According to the published package',
      stay: 'Tour concludes',
    },
  ],
};

export function getTourImage(
  tour: Tour | { slug?: string; destination?: string; imageUrl?: string },
): string {
  if (
    'imageUrl' in tour &&
    tour.imageUrl &&
    typeof tour.imageUrl === 'string' &&
    tour.imageUrl.trim().length > 0
  ) {
    return tour.imageUrl.trim();
  }
  if (tour.slug && TOUR_IMAGES[tour.slug]) {
    return TOUR_IMAGES[tour.slug];
  }
  const slug = (tour.slug || '').toLowerCase();
  const dest = (tour.destination || '').toLowerCase();

  if (slug.includes('long') || dest.includes('quảng ninh') || dest.includes('hạ long'))
    return '/tour-ha-long.jpg';
  if (slug.includes('sapa') || slug.includes('fansipan') || dest.includes('lào cai'))
    return '/tour-sapa.jpg';
  if (slug.includes('ninh-binh') || slug.includes('trang-an') || dest.includes('ninh bình'))
    return '/tour-ninh-binh.jpg';
  if (slug.includes('da-nang') || slug.includes('hoi-an') || dest.includes('đà nẵng'))
    return '/tour-da-nang.jpg';
  if (slug.includes('hue') || dest.includes('huế')) return '/tour-hue.jpg';
  if (slug.includes('nha-trang') || dest.includes('khánh hòa')) return '/tour-nha-trang.jpg';
  if (slug.includes('phu-quoc') || dest.includes('kiên giang') || dest.includes('phú quốc'))
    return '/tour-phu-quoc.jpg';
  if (slug.includes('can-tho') || dest.includes('cần thơ')) return '/tour-can-tho.jpg';
  if (slug.includes('tay-ninh') || dest.includes('tây ninh')) return '/tour-tay-ninh.jpg';

  return '/tour-placeholder.svg';
}

export function getTourLuxuryTag(tour: Tour | { slug?: string }, lang: 'vi' | 'en' = 'vi'): string {
  const slug = tour.slug || '';
  if (lang === 'en') {
    if (slug && TOUR_LUXURY_TAGS_EN[slug]) return TOUR_LUXURY_TAGS_EN[slug];
    return 'BESPOKE JOURNEY';
  }
  if (slug && TOUR_LUXURY_TAGS[slug]) {
    return TOUR_LUXURY_TAGS[slug];
  }
  return 'HÀNH TRÌNH ĐỘC BẢN';
}

export function getTourItinerary(
  tour: Tour | {
    slug?: string;
    durationDays?: number;
    destination?: string;
    itinerary?: unknown;
  },
  lang: 'vi' | 'en' = 'vi',
): ItineraryDay[] {
  if ('itinerary' in tour && Array.isArray(tour.itinerary) && tour.itinerary.length > 0) {
    return tour.itinerary as ItineraryDay[];
  }
  const dict = lang === 'en' ? TOUR_ITINERARIES_EN : TOUR_ITINERARIES;
  if (tour.slug && dict[tour.slug]) {
    return dict[tour.slug];
  }

  // Fallback by keyword in slug
  const slug = (tour.slug || '').toLowerCase();
  for (const [key, val] of Object.entries(dict)) {
    if (slug.includes(key) || key.includes(slug)) {
      return val;
    }
  }

  return [
    {
      day: 1,
      title: lang === 'en' ? 'ITINERARY PENDING VERIFICATION' : 'LỊCH TRÌNH ĐANG CHỜ XÁC MINH',
      activities: [
        lang === 'en'
          ? 'This tour does not yet have a verified itinerary in the backend. It will remain a draft until the operations team completes it.'
          : 'Tour này chưa có lịch trình đã xác minh trong backend. Nội dung cần được bộ phận vận hành hoàn thiện trước khi mở bán.',
      ],
      meals: null,
      stay: null,
      imageUrl: null,
    },
  ];
}
