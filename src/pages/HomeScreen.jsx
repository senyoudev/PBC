import React from "react";
import { Container , Button} from "react-bootstrap";
import {motion} from 'framer-motion'
import {useNavigate} from 'react-router'

const PoapVariants = {
    hidden: { 
      opacity: 0, 
      x: '100vw' 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring', delay: 0.5 }
    },
};

const illustrationVariants = {
    hidden: { 
      opacity: 0, 
      x: '-100vw' 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: 'spring', delay: 0.5 }
    },
};

function HomeScreen() {

    const navigate = useNavigate('')
    const handleNavigation = () => {
        return navigate('/createEvent')
    }

    return (
        <div>
        <div className="whiteSection py-3">
            <Container className="d-flex center align-items-center justify-content-between">
                <div className="leftSection">
                    <p className="quote">keep record of life experiences</p>
                    <h1 className="homePageHeader">
                        create your NOAP <br /> event NOW
                    </h1>
                    <motion.button className="createEventBtn" onClick={handleNavigation}>
                        create event
                    </motion.button>
                </div>
                <motion.div className="rightSection"
                    variants={PoapVariants}
                    initial="hidden"
                    animate="visible">
                </motion.div>
            </Container>
        </div>
        <div className="bottomSection py-5">
            <Container className="d-flex justify-content-center align-items-center">
                <motion.div className="bottomLeftSection"
                variants={illustrationVariants}
                initial="hidden"
                animate="visible">
                    {/* <img src="../images/buttomLeftSectionIllustrations.png" alt="" /> */}
                </motion.div>
                <div className="bottomRightSection">
                    <h3>NOAP community</h3>
                    <p>Sed enim pharetra fusce tortor risus leo cursus leo lacus. Sit amet etiam turpis fermentum. Turpis in tellus massa et laoreet amet id. Nibh id proin bibendum quam. Ut nisi arcu, dui purus cursus enim. Dignissim enim malesuada molestie et. Massa egestas imperdiet facilisis luctus nunc, dignissim eu. Nulla sit vitae maecenas tristique at ultricies blandit volutpat. Neque aliquam lectus egestas feugiat leo, eros, nunc. Dictumst eget elementum integer lectus libero. Posuere condimentum.
                        </p>
                </div>
            </Container>
        </div>
        </div>
    );
  
}

export default HomeScreen;
