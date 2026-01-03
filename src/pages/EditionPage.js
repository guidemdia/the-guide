
import Editions from "../components/Editions";
import Navbar from "../components/Navbar";
import EditionSlider from "../components/EditionSlider";
import Footer from "../components/Footer"
export default function EditionPage() {
  return (
    <div>
         <Navbar />

         <Editions/>
          <EditionSlider/>
          <Footer/>
    </div>
  );
}