// app/review/[reviewId]/page.jsx

import React from "react";
import ReviewDetailClient from "./ReviewDetailClient";


async function ReviewDetail({ params }) {

  const { reviewId } = await params;

  return (
    <div>
      <ReviewDetailClient reviewId={reviewId} />
    </div>
  );
}

export default ReviewDetail;