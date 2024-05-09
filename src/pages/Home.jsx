import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import FilterSection from "../components/FilterSection/FilterSection";
import Bookmarks from "../components/Bookmarks/Bookmarks";
import CategorySection from "../components/Stories/CategorySection/CategorySection";
import RegisterModal from "../components/Modal/RegisterModal/RegisterModal";
import SignInModal from "../components/Modal/SignInModal/SignInModal";
import AddStory from "../components/Stories/AddStory/AddStory";
import MobileAddStory from "../components/MobileUI/MobileAddStory/MobileAddStory";
import StoryViewer from "../components/Stories/StoryViewer/StoryViewer";
import Slide from "../components/Stories/Slide/Slide";
import filters from "../constants/data";
import UserStories from "../components/Stories/UserStories/UserStories";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);

  const searchParamsValues = {
    register: searchParams.get("register"),
    signin: searchParams.get("signin"),
    addstory: searchParams.get("addstory"),
    editstory: searchParams.get("editstory"),
    viewstory: searchParams.get("viewstory"),
    viewbookmarks: searchParams.get("viewbookmarks"),
    userstories: searchParams.get("userstories"),
    slide: searchParams.get("slide"),
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState(["All"]);
  const [story, setStory] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 576);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const validateToken = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/auth/validate`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Token validation error:", error);
      }
    };

    validateToken();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [searchParamsValues.signin]);

  const handleSelectFilters = (filter) => {
    if (filter === "All") {
      setSelectedFilters(["All"]);
    } else {
      const updatedFilters = selectedFilters.includes("All")
        ? [filter]
        : selectedFilters.includes(filter)
        ? selectedFilters.filter((f) => f !== filter)
        : [...selectedFilters, filter];
      if (updatedFilters.length === 0) updatedFilters.push("All");
      setSelectedFilters(updatedFilters);
    }
  };

  const handleStoryViewer = (story) => {
    setStory(story);
    navigate("/?viewstory=true");
  };

  const renderCategorySections = () => {
    if (searchParamsValues.viewbookmarks) {
      return <Bookmarks handleStoryViewer={handleStoryViewer} />;
    } else if (searchParamsValues.userstories) {
      return (
        <UserStories
          selectedFilters={selectedFilters}
          handleStoryViewer={handleStoryViewer}
        />
      );
    } else {
      return (
        <>
          <FilterSection
            selectedFilters={selectedFilters}
            handleSelectFilters={handleSelectFilters}
          />
          {!isMobile && (
            <UserStories
              selectedFilters={selectedFilters}
              handleStoryViewer={handleStoryViewer}
            />
          )}

          {selectedFilters.includes("All")
            ? filters
                .filter((filter) => filter.name !== "All")
                .map((filter) => (
                  <CategorySection
                    key={filter.name}
                    category={filter.name}
                    handleStoryViewer={handleStoryViewer}
                  />
                ))
            : selectedFilters.map((filter) => (
                <CategorySection
                  key={filter}
                  category={filter}
                  isAuthenticated={isAuthenticated}
                  handleStoryViewer={handleStoryViewer}
                />
              ))}
        </>
      );
    }
  };

  return (
    <>
      <Navbar isAuthenticated={isAuthenticated} />
      {renderCategorySections()}

      {searchParamsValues.register && <RegisterModal />}
      {searchParamsValues.signin && <SignInModal />}

      {searchParamsValues.addstory &&
        (isMobile ? <MobileAddStory /> : <AddStory />)}
      {searchParamsValues.editstory &&
        (isMobile ? <MobileAddStory /> : <AddStory />)}
      {searchParamsValues.viewstory && (
        <StoryViewer slides={story} isMobile={isMobile} />
      )}

      {searchParamsValues.slide && <Slide />}
    </>
  );
};

export default Home;
