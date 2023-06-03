import React, { useState, useEffect, useRef } from "react";
import { GoogleButton } from "@/components";
import { useRouter } from "next/router";

const Index = () => {
  const router = useRouter();
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold">Hola, bienvenido a Chattie</h1>
      <GoogleButton />
      <button onClick={() => router.push("/chat")}>ir al chat</button>
    </div>
  );
};

export default Index;
