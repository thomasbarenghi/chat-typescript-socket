import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "../utils/socket";
import { MasterLayout } from "@/components";

interface IMsg {
  user: string;
  msg: string;
  chatId: string;
}

const Index = () => {

  return (
    <MasterLayout>
    </MasterLayout>
  );
};

export default Index;
