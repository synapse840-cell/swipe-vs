import type { Topic } from '../types';

export const MOCK_TOPICS: Topic[] = [
  {
    id: '1',
    title: '究極の選択：どっちが幸せ？',
    category: '仕事',
    optionA: {
      text: '年収3000万・激務',
      imageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=800&fit=crop',
    },
    optionB: {
      text: '年収500万・完全リモート',
      imageUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=800&fit=crop',
    },
    votesA: 12847,
    votesB: 19203,
    viewCount: 89420,
    createdBy: 'salary_debate',
    comments: [
      { id: 'c1', side: 'A', text: 'お金があれば何とかなる！', author: 'サラリーマンA', createdAt: '2026-07-10T12:00:00Z', likes: 234 },
      { id: 'c2', side: 'B', text: '時間が命。自由が最強。', author: 'リモート民', createdAt: '2026-07-10T12:05:00Z', likes: 512 },
      { id: 'c3', side: 'A', text: '激務でも経験値は買えない', author: '野心家', createdAt: '2026-07-10T13:00:00Z', likes: 89 },
      { id: 'c4', side: 'B', text: '健康を失っては意味がない', author: 'ゆるふわ', createdAt: '2026-07-10T14:00:00Z', likes: 178 },
    ],
  },
  {
    id: '2',
    title: '朝食の王者はどっち？',
    category: 'グルメ',
    optionA: {
      text: '和食（ご飯・味噌汁）',
      imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=800&fit=crop',
    },
    optionB: {
      text: '洋食（パン・コーヒー）',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=800&fit=crop',
    },
    votesA: 24561,
    votesB: 21890,
    viewCount: 120340,
    createdBy: 'food_lover',
    comments: [
      { id: 'c5', side: 'A', text: '日本人はやっぱりご飯！', author: '和食派', createdAt: '2026-07-09T08:00:00Z', likes: 67 },
      { id: 'c6', side: 'B', text: '朝パンは至高の幸福', author: 'パン好き', createdAt: '2026-07-09T08:30:00Z', likes: 143 },
    ],
  },
  {
    id: '3',
    title: '夏の休み、どっち派？',
    category: 'ライフスタイル',
    optionA: {
      text: '海でサーフィン',
      imageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&h=800&fit=crop',
    },
    optionB: {
      text: '山でキャンプ',
      imageUrl: 'https://images.unsplash.com/photo-1478131143088-5e74181e3bb3?w=600&h=800&fit=crop',
    },
    votesA: 15670,
    votesB: 18340,
    viewCount: 67800,
    createdBy: 'outdoor_fan',
    comments: [
      { id: 'c7', side: 'A', text: '波乗りは人生のスパイス', author: 'サーファー', createdAt: '2026-07-08T10:00:00Z', likes: 45 },
      { id: 'c8', side: 'B', text: '星空の下でビールが最高', author: 'キャンパー', createdAt: '2026-07-08T11:00:00Z', likes: 92 },
    ],
  },
  {
    id: '4',
    title: 'ペット、どっちを飼う？',
    category: 'ライフスタイル',
    optionA: {
      text: '犬（散歩仲間）',
      imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=800&fit=crop',
    },
    optionB: {
      text: '猫（マイペース）',
      imageUrl: 'https://images.unsplash.com/photo-1514880547357-9ea9e782228f?w=600&h=800&fit=crop',
    },
    votesA: 31200,
    votesB: 29800,
    viewCount: 156000,
    createdBy: 'pet_owner',
    comments: [
      { id: 'c9', side: 'A', text: '犬の笑顔に癒される', author: '犬派', createdAt: '2026-07-07T15:00:00Z', likes: 321 },
      { id: 'c10', side: 'B', text: '猫のツンデレがたまらない', author: '猫派', createdAt: '2026-07-07T16:00:00Z', likes: 287 },
    ],
  },
  {
    id: '5',
    title: 'ゲーム、どっちのスタイル？',
    category: 'エンタメ',
    optionA: {
      text: 'ソロで没頭',
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=800&fit=crop',
    },
    optionB: {
      text: 'フレンドとオンライン対戦',
      imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&h=800&fit=crop',
    },
    votesA: 8900,
    votesB: 14200,
    viewCount: 45000,
    createdBy: 'game_fan',
    comments: [
      { id: 'c11', side: 'A', text: 'ストーリーに浸るのが最高', author: 'ソロ勢', createdAt: '2026-07-06T20:00:00Z', likes: 56 },
      { id: 'c12', side: 'B', text: '友達との連携プレイが熱い', author: 'マルチ勢', createdAt: '2026-07-06T21:00:00Z', likes: 124 },
    ],
  },
  {
    id: '6',
    title: 'デート、どっちが理想？',
    category: '恋愛',
    optionA: {
      text: '静かなカフェで語り合う',
      imageUrl: 'https://images.unsplash.com/photo-1511923499332-2d1a0b9c5b8e?w=600&h=800&fit=crop',
    },
    optionB: {
      text: 'テーマパークではしゃぐ',
      imageUrl: 'https://images.unsplash.com/photo-1597466599360-3bf75c87fd69?w=600&h=800&fit=crop',
    },
    votesA: 11200,
    votesB: 9800,
    viewCount: 52000,
    createdBy: 'love_debate',
    comments: [
      { id: 'c13', side: 'A', text: '会話が一番大事', author: 'ロマンチスト', createdAt: '2026-07-05T18:00:00Z', likes: 88 },
      { id: 'c14', side: 'B', text: '一緒に笑える時間が最強', author: 'アクティブ派', createdAt: '2026-07-05T19:00:00Z', likes: 102 },
    ],
  },
  {
    id: '7',
    title: '転職、何を優先する？',
    category: '仕事',
    optionA: {
      text: '年収アップ',
      imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=800&fit=crop',
    },
    optionB: {
      text: 'ワークライフバランス',
      imageUrl: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600&h=800&fit=crop',
    },
    votesA: 16700,
    votesB: 21400,
    viewCount: 73000,
    createdBy: 'career_coach',
    comments: [
      { id: 'c15', side: 'A', text: 'まずはキャッシュを固めたい', author: '現実派', createdAt: '2026-07-04T09:00:00Z', likes: 76 },
      { id: 'c16', side: 'B', text: '燃え尽きたら意味ない', author: 'バランス派', createdAt: '2026-07-04T10:00:00Z', likes: 134 },
    ],
  },
  {
    id: '8',
    title: 'ラーメン、どっち派？',
    category: 'グルメ',
    optionA: {
      text: '濃厚豚骨',
      imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=800&fit=crop',
    },
    optionB: {
      text: 'あっさり醤油',
      imageUrl: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=600&h=800&fit=crop',
    },
    votesA: 19800,
    votesB: 17600,
    viewCount: 91000,
    createdBy: 'ramen_fan',
    comments: [
      { id: 'c17', side: 'A', text: 'こってりが正義', author: '豚骨信者', createdAt: '2026-07-03T12:00:00Z', likes: 201 },
      { id: 'c18', side: 'B', text: '毎日食べられるのは醤油', author: '毎日麺', createdAt: '2026-07-03T13:00:00Z', likes: 167 },
    ],
  },
];
