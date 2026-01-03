import About from "../components/About";
import Navbar from "../components/Navbar";
import Individual from "../components/Individual";
import SuggestedArticles from "../components/SuggestArticles";
import Footer from "../components/Footer"

export default function IndividualPage() {
  return (
    <div>
         <Navbar />
      <Individual/>
           <SuggestedArticles/>
                     <Footer/>
    </div>
  );
}
