"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchModal from "./modals/SearchModal";
import type { Story } from "@prisma/client";

export default function Searchbar({ stories }: { stories: Story[] }) {
  
  const [showModal, setShowModal] = useState(false);
  const handleModalOpen = () =>{
    setShowModal(prev => !prev)
  }
  return (
    <div>
      <input
        type="text"
        placeholder="Search"
        readOnly
        onClick={handleModalOpen}
      />
      {showModal && <SearchModal onClose={handleModalOpen} stories={stories} />}
    </div>
  );
}
