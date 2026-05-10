"use client";

type DeleteTweetButtonProps = {
  className?: string;
};

export default function DeleteTweetButton({ className }: DeleteTweetButtonProps) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        const confirmed = window.confirm(
          "Are you sure you want to delete this tweet?",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      Delete
    </button>
  );
}
