import "./Footer.css";

const Footer = () => {

    return (
        <div className="footer">
            <div className="footer__container">
                <div className="footer__info-social">
                    <div className="footer__info">
                        <img src="/Images/logo_white.svg" alt="Shop house logo" className="footer__logo" />
                        <ul className="footer__list info__list">
                            <li className="footer__item info__item">268 Ly Thuong Kiet</li>
                            <li className="footer__item info__item">+84 999-999-999</li>
                            <li className="footer__item info__item">MealMate@IUFC.com</li>
                        </ul>
                    </div>

                    <div className="footer__social">
                        <h3 className="footer-subtitle">OUR SOCIAL MEDIA</h3>
                        <ul className="footer__list social__list">
                          <li className="footer__item social__item">
                            <a
                              href="#"
                              className="social__link"
                              aria-label="Visit our Facebook page"
                            >
                              <i className="fa fa-facebook" aria-hidden="true"></i>
                            </a>
                          </li>
                          <li className="footer__item social__item">
                            <a
                              href="#"
                              className="social__link"
                              aria-label="Visit our Instagram profile"
                            >
                              <i className="fa fa-instagram" aria-hidden="true"></i>
                            </a>
                          </li>
                          <li className="footer__item social__item">
                            <a
                              href="#"
                              className="social__link"
                              aria-label="Visit our Twitter account"
                            >
                              <i className="fa fa-twitter-square" aria-hidden="true"></i>
                            </a>
                          </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Footer;