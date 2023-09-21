import { IconByName } from "@shiksha/common-lib";
import { HStack, Pressable, Text, VStack } from "native-base";
import React, { useState } from "react";

const StarRating = ({ value, onChange, required, schema }) => {
  const { ratingLabels, totalStars } = schema || {};
  const [rating, setRating] = useState(value);

  const handleStarClick = (starIndex) => {
    const starvalue = starIndex + 1;
    setRating(`${starvalue}`);
    onChange(`${starvalue}`);
  };

  React.useEffect(() => {
      setRating(`${value}`);
    }, [value]);

  return (
    <HStack width={"80%"} mx={"auto"} my={4} justifyContent={"space-evenly"}>
      {[...Array(totalStars)].map((_, index) => (
        <Pressable key={_} onPress={() => handleStarClick(index)}>
          <VStack justifyContent={"center"} alignItems={"center"}>
            <IconByName
              isDisabled
              name={"StarFillIcon"}
              color={index < rating ? "amber.400" : "iconColor.100"}
              _icon={{ size: "30px" }}
            />
            {ratingLabels?.[index] && (
              <Text color={index < rating ? "amber.400" : "iconColor.100"}>
                {ratingLabels?.[index]}
              </Text>
            )}
          </VStack>
        </Pressable>
      ))}
    </HStack>
  );
};;

export default StarRating;
