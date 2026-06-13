import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Wish } from "../types";
import { getWishes } from "../api/wishes";

export default function WishesPage() {
    const { wishlistId } = useParams();
    const [wishes, setWishes] = useState<Wish[]>([]);

    useEffect(() => {
        if (wishlistId) {
            getWishes(Number(wishlistId)).then(setWishes);
        }
    }, [wishlistId]);

    return (
        <div>
            <h1>Желания</h1>
            {wishes.map((w) => (
                <div key={w.id}>
                    {w.title} {w.price ? `— ${w.price}₽` : ""}
                </div>
            ))}
        </div>
    );
}
