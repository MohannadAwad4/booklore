
import Image from "next/image";
import Link from "next/link";
import { StoryType } from "@/lib/types";
export default function SearchCard({story}:{story:StoryType}){
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