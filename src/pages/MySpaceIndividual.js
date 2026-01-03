import About from "../components/About";
import Navbar from "../components/Navbar";
import Individual from "../components/Individual";
import SuggestedArticles from "../components/SuggestArticles";
import Footer from "../components/Footer"
import MySpaceSingle from "../components/MyspaceSingle";
import SuggestedMySpace from "../components/SuggestedMySpace";

export default function IndividualPage() {
  return (
    <div>
         <Navbar />
      <MySpaceSingle/>
           <SuggestedMySpace/>
                     <Footer/>
    </div>
  );
}
