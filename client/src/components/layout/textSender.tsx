import { getSocket } from "@/utils/socket";
import { useAppSelector } from "@/redux/hooks";
import { Message } from "@/types/content/message";

const TextSender = () => {
  const socket = getSocket();
  const currentUser = useAppSelector(
    (state) => state.authSession.session.current._id
  );
  const chatId: any = useAppSelector((state) => state.chats.currentChat.id);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const image = e.target.image.files[0];
    const msj = e.target.msg.value;

    const message: Message = {
      user: currentUser,
      msg: msj && msj.length > 0 ? msj : null,
      chatId: chatId,
      image:
        image && (msj.length <= 0 || !msj)
          ? {
              file: image,
              fileName: image.name,
            }
          : null,
    };
    sendMessage(message);
    e.target.reset();
  };

  const sendMessage = (message: Message) => {
    socket!.emit("message", message);
  };

  return (
    <>
      <div className="flex w-full  px-6  pb-6 ">
        <div className=" flex h-[60px] w-full rounded-full border border-violet-200 bg-white">
          <form
            className="flex w-full items-center justify-between gap-2 px-6 py-3"
            onSubmit={handleSubmit}
          >
            <input
              className="flex-grow rounded-full  py-2 text-sm font-normal text-violet-800 outline-none placeholder:text-violet-800"
              placeholder="Escribe un mensaje"
              name="msg"
            />
            <input
              className="flex-grow rounded-full  py-2 text-sm font-normal text-violet-800 outline-none placeholder:text-violet-800"
              type="file"
              name="image"
            />
            <button className=" text-sm font-semibold text-violet-800">
              Enviar
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default TextSender;
