import React, { Component } from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class PageContent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  // componentDidCatch(error, info) {}

  render() {
    return (
      <div className="max-w-lg mx-auto border-gray-600 md:border-r-2 md:border-l-2 px-4 pb-4 shadow-xl h-full">
        {this.state.hasError ? (
          <p>There was an error. Please refresh.</p>
        ) : (
          this.props.children
        )}
      </div>
    );
  }
}

export default PageContent;
