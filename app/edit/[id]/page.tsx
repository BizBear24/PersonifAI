"use client";

import { useParams } from "next/navigation";
import CharacterForm from "@/components/CharacterForm";

export default function Edit() {
  const { id } = useParams<{ id: string }>();
  return <CharacterForm editId={id} />;
}
