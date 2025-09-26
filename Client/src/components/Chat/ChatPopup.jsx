
// import React from "react";
// import ChatApp from "./ChatApp";

// export default function ChatPopup({ currentUserId, onClose }) {
//     return (
//         <div className="fixed bottom-[90px] right-5 w-[400px] h-[500px] bg-white border border-gray-300 rounded-lg shadow-2xl flex flex-col z-[2000]">
//             <div className="bg-green-600 text-white p-2.5 rounded-t-lg flex justify-between items-center">
//                 <span className="font-semibold">Chat</span>
//                 <button
//                     onClick={onClose}
//                     className="bg-transparent border-none text-white cursor-pointer text-lg hover:text-gray-200 transition-colors"
//                 >
//                     ✕
//                 </button>
//             </div>
//             <div className="flex-1 overflow-hidden">
//                 <ChatApp currentUserId={currentUserId} />
//             </div>
//         </div>
//     );
// }

import React from "react";
import ChatApp from "./ChatApp";

export default function ChatPopup({ currentUserId, role, onClose }) {
    return (
        <div className="fixed bottom-[90px] right-5 w-[400px] h-[500px] bg-white border border-gray-300 rounded-lg shadow-2xl flex flex-col z-[2000]">
            <div className="bg-green-600 text-white p-2.5 rounded-t-lg flex justify-between items-center">
                <span className="font-semibold">Chat</span>
                <button
                    onClick={onClose}
                    className="bg-transparent border-none text-white cursor-pointer text-lg hover:text-gray-200 transition-colors"
                >
                    ✕
                </button>
            </div>
            <div className="flex-1 overflow-hidden">
                <ChatApp currentUserId={currentUserId} role={role} />
            </div>
        </div>
    );
}