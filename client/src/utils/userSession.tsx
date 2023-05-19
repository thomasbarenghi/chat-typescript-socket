import axios from "axios";
const urlServer = process.env.NEXT_PUBLIC_SERVER_URL;

type Props = {
    clientId: string;
  };

export function createUserSession(user:any) {
  const {
    firstName,
    lastName,
    bio,
    _id,
    email,
    username,
    image,
    backImage,
    softDelete,
  } = user;

  return {
    firstName,
    lastName,
    bio,
    profilePicture: image,
    _id,
    email,
    userName: username,
    backImage,
    softDelete,
  };
}

export const getUserData = async ({ clientId }: Props) => {
  try {
    const { data: response } = await axios.get(
      `${urlServer}api/user/${clientId}`
    );

    const session = createUserSession(response);

    return session;
  } catch (error) {
    console.log("Error al obtener los datos del usuario", error);
    return;
  }
};
