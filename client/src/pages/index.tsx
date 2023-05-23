import React, { useState, useEffect, useRef } from "react";
import { GoogleButton } from "@/components";

interface IMsg {
  user: string;
  msg: string;
  chatId: string;
}

const Index = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <h1 className="text-3xl font-semibold">Hola, bienvenido a Chattie</h1>
      <GoogleButton />
    </div>
  );
};

export default Index;
