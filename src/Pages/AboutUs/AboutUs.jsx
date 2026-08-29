import React from "react";
import { Header, Footer } from "../../Components";
import FeatureAd from "../../Components/Common/Feature_Ad/FeatureAd";
import "./AboutUs.scss"; // Create this CSS file for styling

const AboutUs = () => {
  return (
    <div className="about-us">
      <Header />
      <div className="about-us-container">
        <div className="about-us-content">
          {/* Left-side image */}
          <div className="about-us-image">
            <img src="/Images/about-us/img0.jpg" alt="About Us" />
          </div>

          {/* Right-side text */}
          <div className="about-us-rightside">
            <div className="about-us-text">
              <h1>Welcome to IUFC</h1>
              <p>
                In the era of Industry 4.0, while technological advancements have made food delivery
                more accessible, they have also reduced cooking skills, especially among Vietnam’s
                Gen Z. Dependence on convenience foods poses health risks due to excess oil, salt,
                and sugar, leading to obesity and high blood pressure. Additionally, dining out is
                more expensive than cooking at home. Despite awareness of nutrition, many lack the
                time or motivation to plan and shop for healthy meals.
              </p>
              <p>
                A Food Ingredient Shopping website can bridge this gap by offering fresh,
                high-quality ingredients and supporting local agriculture for fresher produce and
                reduced environmental impact. Meal kits, recipes, and tutorials make cooking easier
                and enjoyable, fostering confidence in home meal preparation. This initiative
                promotes healthier eating, cost savings, and stronger connections to local farmers,
                benefiting individuals and communities alike.
              </p>
            </div>
            <div className="about-us-carousel">
              <button className="carousel-arrow left-arrow">{"<"}</button>
              <div className="carousel-images">
                <img src="/Images/about-us/caro1.png" alt="carousel 1" />
                <img src="/Images/about-us/caro2.png" alt="carousel 2" />
                <img src="/Images/about-us/caro3.png" alt="carousel 3" />
              </div>
              <button className="carousel-arrow right-arrow">{">"}</button>
            </div>
          </div>
        </div>

        {/* Bottom image carousel */}
      </div>
      <FeatureAd />
      <Footer />
    </div>
  );
};

export default AboutUs;
