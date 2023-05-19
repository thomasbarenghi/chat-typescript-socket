import { useDispatch } from "react-redux";
import { setLoginMethod } from "@/redux/slices/authSession";
import { useRouter } from "next/router";
import Image from "next/image";
const urlServer = process.env.NEXT_PUBLIC_SERVER_URL;

export default function GoogleButton() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = async() => {
   await dispatch(setLoginMethod("google"));
    router.push(`${urlServer}api/auth/google`);
  };

  return (
    <>
    <button
      className="text-base-medium flex w-full  items-center justify-center gap-2 rounded-full border px-8 py-2 text-black"
      style={{ background: "#fff" }}
      onClick={handleLogin}
    >
      <div className="rounded-full bg-white p-2">
        <Image
          src="/icon/google.png"
          alt="Google"
          width={15}
          height={15}
          className="aspect-square"
        />
      </div>
      <span>Continuar con google</span>
    </button>
    </>
  )
}


