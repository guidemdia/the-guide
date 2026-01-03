import EditionSlider from "../components/EditionSlider";


import Interface from "../components/Interface";
import Navbar from "../components/Navbar";
import SliderL from "../components/SliderL";
import SliderR from "../components/SliderR";
import ArticleGrid from "../components/ArticleGrid";

import Footer from "../components/Footer"
import Single from "../components/Single"
export default function Home() {
  return (
    <div>
         <Navbar />
      <Interface/>
        
        
            <SliderL/>
                   <SliderR/>
            <Single/>
         <ArticleGrid />
          <EditionSlider/>
          <Footer/>
    </div>
  );
}
