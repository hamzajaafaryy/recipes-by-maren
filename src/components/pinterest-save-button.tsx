type PinterestSaveButtonProps = {
  pageUrl: string;
  imageUrl: string;
  description: string;
};

export default function PinterestSaveButton({ pageUrl, imageUrl, description }: PinterestSaveButtonProps) {
  const shareUrl = new URL("https://www.pinterest.com/pin/create/button/");
  shareUrl.searchParams.set("url", pageUrl);
  shareUrl.searchParams.set("media", imageUrl);
  shareUrl.searchParams.set("description", description);

  return (
    <a
      className="pinterest-save-button"
      href={shareUrl.toString()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Save ${description} to Pinterest`}
    >
      <span aria-hidden="true">P</span>
      Save this recipe
    </a>
  );
}
