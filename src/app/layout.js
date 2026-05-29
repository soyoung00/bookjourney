
import "./globals.css";
import Provider from "./provider";


export const metadata = {
  title: "BookJourney",
  description: "독서 기록 플랫폼",
};

export default function RootLayout({ children }) {
  return (
<html lang="ko">
      <body>
        <Provider>
        <div className="mobile-wrap">
          {children}
        </div>
        </Provider>
      </body>
    </html>
  );
}
