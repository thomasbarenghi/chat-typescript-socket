type Props = {
    chats: any;
    user: any;
  };
  
  export const chatsFormater = ({ chats, user }: Props) => {
    if (chats[0] === null) return null;
  
    console.log("chats", chats);
    const chatsFiltered = chats.map((chat: any) => {
      const filteredParticipants = chat.participants.filter(
        (participant: any) => participant._id !== user._id
      );
      const updatedChat = Object.assign({}, chat);
      if (filteredParticipants.length > 0) {
        updatedChat.participants = filteredParticipants[0];
      } else {
        updatedChat.participants = null;
      }
  
      const updatedChat2 = {
        ...updatedChat,
        messages: updatedChat.messages,
        participants: updatedChat.participants,
        // time: time,
      };
  
      return updatedChat2;
    });
  
    return chatsFiltered;
  };