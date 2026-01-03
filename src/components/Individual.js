import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";

import SuggestedArticles from "./SuggestArticles";

export default function Individual() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const navigate = useNavigate();

   useEffect(() => {
    const fetchArticle = async () => {
      const snap = await getDocs(collection(db, "writings"));
      const allBlogs = snap.docs.map((doc) => ({ ...doc.data(), docId: doc.id }));
      const found = allBlogs.find((blog) => String(blog.id) === String(id));
      setArticle(found || null);
    };

    fetchArticle();
  }, [id]);


  if (!article) return <div className="text-center py-20 text-gray-500">Article not found</div>;

  return (
   <div className=" mx-auto lg:ml-[340px] py-16 mt-10">
      <h1 className="text-4xl lg:w-[800px] font-bold mb-6">{article.title}</h1>
      <p className="text-gray-600 mb-4">By {article.author}</p>
      {article.image && (
        <img
          src={article.image}
          className=" h-96 lg:w-[800px] object-cover mb-6"
        />
      )}
      <div

      
  className="text-gray-800 lg:w-[800px] text-[20px] leading-8"
  dangerouslySetInnerHTML={{ __html: article.full }}
></div>
<div className="h-[1px] w-full bg-gray-300 my-16">
</div>
    </div>
  );
}
