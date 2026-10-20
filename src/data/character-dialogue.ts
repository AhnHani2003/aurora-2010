import type {
  Expression,
  Gesture,
  Reaction,
} from "@/components/character/model";

type Line = {
  expression: Expression;
  gesture: Gesture;
  dialogue: string;
  dialogueVi: string;
  effect: Reaction["effect"];
  feedbackHeading?: { en: string; vi: string };
};
const line = (
  expression: Expression,
  gesture: Gesture,
  dialogue: string,
  dialogueVi: string,
  effect?: Reaction["effect"],
): Line => ({ expression, gesture, dialogue, dialogueVi, effect });

/** Presentation only, after an answer is evaluated. Both languages share stable question/option IDs. */
export const QUIZ_REACTIONS: Record<string, Record<string, Line>> = {
  q1: {
    A: line(
      "blushing",
      "heart",
      "That's right! I love you the most, most, most. You should know this one by heart 🤭",
      "Đúng rồi! Anh yêu em nhất nhất nhất. Câu này phải thuộc lòng chứ 🤭",
      "hearts",
    ),
    B: line(
      "shocked",
      "point",
      "Excuse me?! Who said they love the other more? WHO???",
      "Ơ kìa?! Ai nói yêu nhiều hơn? Là ai???",
    ),
  },
  q2: {
    A: line(
      "smug",
      "thumbs-up",
      "Finally! Someone appreciates my photography skills!",
      "Cuối cùng cũng có người công nhận tay nghề nhiếp ảnh gia riêng của em rồi!",
      "hearts",
    ),
    B: {
      ...line(
        "pouting",
        "cross-arms",
        "Whose photos look better in my camera roll? Yours! So the better photographer is obviously me.",
        "Trong máy của anh ảnh ai đẹp hơn. Là em! Vậy người chụp đẹp hơn chính là anh.",
      ),
      feedbackHeading: {
        en: "Hey! Are you saying I'm bad at this? 😡",
        vi: "Ơ kìa! Em có chê anh đúng hong 😡",
      },
    },
  },
  q3: {
    A: line(
      "smug",
      "point",
      "A tempting answer. But even my ego knows you are the adorable one.",
      "Nghe cũng thích đó. Nhưng anh có tự luyến mấy cũng biết em mới là người đáng yêu nhất.",
    ),
    B: line(
      "happy",
      "heart",
      "Correct. You're the cutest in the whole world, hehe 🤭",
      "Chính xác. Em đáng yêu nhất trên đời hẹ hẹ 🤭",
      "hearts",
    ),
  },
  q4: {
    A: line(
      "shocked",
      "facepalm",
      "Me, annoying? Every bit of me loves you, and you call me annoying?",
      "Anh mà đáng ghét hả? Chỗ nào cũng yêu em mà ghét ngta.",
    ),
    B: line(
      "laughing",
      "clap",
      "You're a little stubborn and a tiny bit feisty, but I still love you so much 😘",
      "Em hơi lì, hơi dữ xíu hoi nhưng mà vẫn yêu em nhiều 😘",
      "hearts",
    ),
  },
  q5: {
    A: line(
      "blushing",
      "thumbs-up",
      "Wrong answer, but I'll take it. Keep the compliments coming; I can handle them 🤭",
      "Sai đáp án nhưng mà cũng cũng đi. Em cứ khen tiếp đi, anh chịu được 🤭",
    ),
    B: line(
      "shocked",
      "facepalm",
      "So I'll take a step back... Give me a minute to hold my shattered heart, then we'll keep playing 😖",
      "Nên anh lùi bước về sau... Cho anh một phút ôm trái tim vụn vỡ này rồi mình chơi tiếp nha 😖",
      "hearts",
    ),
  },
  q6: {
    A: line(
      "smug",
      "thumbs-up",
      "Flattery like that deserves ten kisses from me. But the official answer still isn't changing, princess.",
      "Nịnh thế này thì xứng đáng được anh hôn 10 cái đó. Nhưng đáp án đúng vẫn không đổi nha em.",
    ),
    B: line(
      "happy",
      "heart",
      "Obviously you. My taste is second to none, after all 😏",
      "Tất nhiên là em rồi. Gu thẩm mĩ của anh là số 1 mà lại 😏",
      "hearts",
    ),
  },
  q7: {
    A: line(
      "pouting",
      "cross-arms",
      "Me? Sulk? I wouldn't dream of it 🤥",
      "Anh chả thèm dỗi 🤥",
    ),
    B: line(
      "laughing",
      "point",
      "On an unlucky day, even breathing the wrong way has me a little worried 🫣",
      "Hôm nào xui xui anh lỡ thở sai cách xíu hoi là cũng lo lo rùi á 🫣",
      "hearts",
    ),
  },
  q8: {
    A: line(
      "romantic",
      "heart",
      "I miss you a ridiculous amount. But I know you miss me too.",
      "Anh nhớ em siêu siêu nhiều luôn. Nhưng anh biết em cũng nhớ anh mà.",
    ),
    B: line(
      "pouting",
      "point",
      "How could you say I don't miss you? Honestly 🙄",
      "Nghĩ sao mà kêu tui không nhớ vậy trời 🙄",
    ),
    C: line(
      "blushing",
      "heart",
      "Both of us, obviously. Who wouldn't miss the person they love when they're apart?",
      "Cả hai chứ còn gì nữa. Yêu mà hong gặp thì ai chả nhớ",
      "hearts",
    ),
  },
  q9: {
    A: line(
      "laughing",
      "wave",
      "You got me =))))) Can't argue when you're that right",
      "Chịu òi =))))) đúng quá biết sao giờ",
      "hearts",
    ),
    B: line(
      "mock-angry",
      "cross-arms",
      "Excuse me, do you really think you can out-baby me?",
      "Ơ kìa, nhắm nhõng nhẽo bằng tui hong?",
    ),
  },
  q10: {
    A: line(
      "shocked",
      "point",
      "Me, jealous? The winner never gets jealous 😏",
      "Anh ghen á? Kẻ thắng cuộc không bao giờ ghen 😏",
    ),
    B: line(
      "smug",
      "point",
      "I knew it! Caught you, princess!",
      "Biết ngay mà! Bắt quả tang công chúa ghen rồi nha!",
      "hearts",
    ),
  },
  q11: {
    A: line(
      "blushing",
      "heart",
      "That's right. I'm the baby, after all 🫣",
      "Đúng rồi. Anh là em bé mà lại 🫣",
      "hearts",
    ),
    B: line(
      "pouting",
      "cross-arms",
      "'I'm in a mood today, so don't you dare touch me, okay?'",
      "'Hôm nay em đang khó chịu đừng có đụng vô người em à nha'",
    ),
  },
  q12: {
    A: line(
      "smug",
      "point",
      "Your reactions are too cute. I consider teasing a public service.",
      "Tại em phản ứng cưng quá đó. Anh trêu một chút cho đời vui thôi mà.",
      "hearts",
    ),
    B: line(
      "shocked",
      "facepalm",
      "I don't dare get annoyed, because you'd get annoyed right back at me 🤭",
      "Hong dám bực tại sợ bị bực ngược lại 🤭",
    ),
  },
  q13: {
    A: line(
      "romantic",
      "blow-kiss",
      "I built you a secret garden. Consider that Exhibit A.",
      "Anh làm hẳn một khu vườn bí mật cho em. Bằng chứng số một rõ ràng thế còn gì.",
      "hearts",
    ),
    B: line(
      "pouting",
      "cross-arms",
      "Princess, there's a whole love website right in front of you 😑",
      "Công chúa ơi, cả một trang web tình yêu đang trước mặt em kìa 😑",
    ),
  },
  q14: {
    A: line(
      "laughing",
      "cry",
      "My toys are expensive, okay? Have a little sympathy. Sniff, sniff 🥹",
      "Đồ chơi của anh nó mắc quá thông cảm cho anh. Hic hic 🥹",
      "hearts",
    ),
    B: line(
      "shocked",
      "facepalm",
      "You save all your money to buy me presents instead 😘",
      "Em toàn để tiền mua quà cho anh thì có 😘",
    ),
  },
  q15: {
    A: line(
      "blushing",
      "blow-kiss",
      "Who else but me 🤭",
      "Anh chứ ai vào đây nữa 🤭",
      "hearts",
    ),
    B: line(
      "pouting",
      "heart",
      "You always start with a teeth-and-breath check, that's all 😒",
      "Em toàn kiểm tra răng miệng trước thôi 😒",
    ),
  },
};
