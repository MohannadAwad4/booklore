import { Story } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
export default function SearchCard({story}:{story:Story}){
    const coverSrc = story.coverUrl || "/images/default-cover.png";
    return (
        <Link href={`/book/${story.id}/chapters`}>
            <Image src={coverSrc} alt={story.title} width={100} height={100} />
            <div>
                <h3>{story.title}</h3>
                <p>{story.description}</p>
            </div>
        </Link>
    )
}