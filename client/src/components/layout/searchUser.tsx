import axios from "axios";
import Image from "next/image";
import { useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { newChat } from "@/redux/slices/chats";

const SearchUser = () => {
  const [users, setUsers] = useState([]);
  const dispatch = useAppDispatch();

  const searchUser = async (e: any) => {
    try {
      const usersGetted = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}api/user/?email=${e.target.value}`
      );
      setUsers(usersGetted.data);
    } catch (error) {
      console.log(error);
    }
  };

  const createChat = async (id: string) => {
    dispatch(newChat(id));
  };

  return (
    <>
      <div className=" w-full">
        <div>
          <input
            type="text"
            onChange={searchUser}
            className="mb-3 w-full  min-w-[0] rounded-full border border-violet-200 px-3 py-2 text-sm text-violet-800 placeholder:text-violet-800 "
            placeholder="Buscar usuario"
          />
        </div>
        <div className="flex flex-col gap-2">
          {users.map((user: any) => (
            <div
              className="flex cursor-pointer items-center gap-2 rounded-full bg-violet-200  p-1 pr-4"
              onClick={() => createChat(user._id)}
            >
              <Image
                src={user.image || "/image/p4.jpg"}
                alt="logo"
                width={40}
                height={40}
                className=" aspect-square rounded-full bg-white object-cover p-[2px] "
              />
              <p className="text-sm font-normal text-violet-800">
                {user.email}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SearchUser;
