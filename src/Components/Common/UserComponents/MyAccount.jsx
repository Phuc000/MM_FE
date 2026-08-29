// src/Components/Common/UserComponents/MyAccount.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../../hooks/useAuth";
import { Card, CardContent, Typography, Box, Avatar, Grid } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";

// Keyframes for gradient animation
const moveGradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[3],
}));

const RankFrame = styled(Box)(({ theme }) => ({
  "--border-width": "4px",
  position: "relative",
  width: 140,
  height: 140,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#fff", // Background color inside the frame
  zIndex: 1, // Ensure content is above the gradient border

  "&::after": {
    content: '""',
    position: "absolute",
    top: `calc(-1 * var(--border-width))`,
    left: `calc(-1 * var(--border-width))`,
    width: `calc(100% + (var(--border-width) * 2))`,
    height: `calc(100% + (var(--border-width) * 2))`,
    borderRadius: "50%",
    background:
      "linear-gradient(60deg, hsl(224,85%,66%), hsl(269,85%,66%), hsl(314,85%,66%), hsl(359,85%,66%), hsl(44,85%,66%), hsl(89,85%,66%), hsl(134,85%,66%), hsl(179,85%,66%))",
    backgroundSize: "300% 300%",
    backgroundPosition: "0% 50%",
    animation: `${moveGradient} 4s alternate infinite`,
    zIndex: -1,
  },
}));

const RankImage = styled("img")({
  width: "80%",
  height: "80%",
  objectFit: "contain",
});

const MyAccount = () => {
  const { user } = useAuth();
  const [rank, setRank] = useState("");

  useEffect(() => {
    if (user && user.id) {
      fetchRank(user.id);
    }
  }, [user]);

  const fetchRank = async (userId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_API_URL}/customers/customer-rank/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      setRank(response.data.rank);
    } catch (error) {
      console.error("Error fetching rank:", error);
    }
  };

  const getRankIcon = () => {
    switch (rank.toLowerCase()) {
      case "iron":
        return <RankImage src="/Images/user-ranks/iron.png" alt="Iron Rank" />;
      case "bronze":
        return <RankImage src="/Images/user-ranks/bronze.png" alt="Bronze Rank" />;
      case "silver":
        return <RankImage src="/Images/user-ranks/silver.png" alt="Silver Rank" />;
      case "gold":
        return <RankImage src="/Images/user-ranks/gold.png" alt="Gold Rank" />;
      case "platinum":
        return <RankImage src="/Images/user-ranks/plat.png" alt="Platinum Rank" />;
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Typography variant="h5" align="center" sx={{ mt: 4 }}>
        Loading...
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: "0 auto", mt: 4, px: 2 }}>
      <StyledCard>
        <CardContent>
          <Grid container spacing={4}>
            {/* User Information */}
            <Grid item xs={12} md={6}>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "#fe3bd4",
                    fontSize: 32,
                    mr: 3,
                  }}
                >
                  {user.fName.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontFamily: "Quicksand",
                      fontWeight: "900",
                    }}
                  >
                    {user.fName} {user.lName}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Phone Number:</strong> {user.phoneNumber}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Address:</strong> {user.address}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Rank Information */}
            <Grid item xs={12} md={6} display="flex" flexDirection="column" alignItems="center">
              {rank ? (
                <>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontFamily: "Quicksand",
                      fontWeight: "900",
                    }}
                  >
                    Your Current Rank
                  </Typography>
                  <RankFrame>{getRankIcon()}</RankFrame>
                  <Typography
                    variant="h6"
                    sx={{
                      mt: 2,
                      fontFamily: "Quicksand",
                      fontWeight: "900",
                    }}
                  >
                    {rank.charAt(0).toUpperCase() + rank.slice(1)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1">No rank available</Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </StyledCard>
    </Box>
  );
};

export default MyAccount;
