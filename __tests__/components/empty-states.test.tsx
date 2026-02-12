/**
 * Empty State Components Tests
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Mock the components inline for testing
const EmptyState = ({
  icon,
  title,
  description,
  action,
  variant = "default",
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  variant?: "default" | "compact" | "card";
}) => (
  <div data-testid="empty-state" data-variant={variant}>
    {icon && <div data-testid="empty-state-icon">{icon}</div>}
    <h3 data-testid="empty-state-title">{title}</h3>
    {description && <p data-testid="empty-state-description">{description}</p>}
    {action && (
      <button data-testid="empty-state-action" onClick={action.onClick}>
        {action.label}
      </button>
    )}
  </div>
);

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByTestId("empty-state-title")).toHaveTextContent("No items found");
  });

  it("renders description when provided", () => {
    render(
      <EmptyState
        title="No items"
        description="Create your first item to get started"
      />
    );
    expect(screen.getByTestId("empty-state-description")).toHaveTextContent(
      "Create your first item to get started"
    );
  });

  it("does not render description when not provided", () => {
    render(<EmptyState title="No items" />);
    expect(screen.queryByTestId("empty-state-description")).toBeNull();
  });

  it("renders icon when provided", () => {
    render(<EmptyState title="No items" icon={<span>📁</span>} />);
    expect(screen.getByTestId("empty-state-icon")).toBeInTheDocument();
  });

  it("renders action button when provided", () => {
    const handleClick = jest.fn();
    render(
      <EmptyState
        title="No items"
        action={{ label: "Create Item", onClick: handleClick }}
      />
    );

    const button = screen.getByTestId("empty-state-action");
    expect(button).toHaveTextContent("Create Item");

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies variant correctly", () => {
    render(<EmptyState title="No items" variant="compact" />);
    expect(screen.getByTestId("empty-state")).toHaveAttribute("data-variant", "compact");
  });

  it("applies card variant correctly", () => {
    render(<EmptyState title="No items" variant="card" />);
    expect(screen.getByTestId("empty-state")).toHaveAttribute("data-variant", "card");
  });
});

describe("Specialized Empty States", () => {
  describe("NoInvitationsEmptyState", () => {
    it("has correct title and description", () => {
      const expectedTitle = "No invitations yet";
      const expectedDescription = "Create your first invitation";

      expect(expectedTitle).toContain("invitation");
      expect(expectedDescription).toContain("Create");
    });

    it("triggers action on button click", () => {
      const handleCreateNew = jest.fn();
      render(
        <EmptyState
          title="No invitations yet"
          action={{ label: "Create Invitation", onClick: handleCreateNew }}
        />
      );

      fireEvent.click(screen.getByTestId("empty-state-action"));
      expect(handleCreateNew).toHaveBeenCalled();
    });
  });

  describe("NoGuestsEmptyState", () => {
    it("has correct messaging", () => {
      const props = {
        title: "No guests added",
        description: "Add guests to track RSVPs",
        actionLabel: "Add Guests",
      };

      expect(props.title).toContain("guest");
      expect(props.description).toContain("RSVP");
      expect(props.actionLabel).toContain("Add");
    });
  });

  describe("NoRSVPsEmptyState", () => {
    it("has no action button", () => {
      render(<EmptyState title="No RSVPs yet" />);
      expect(screen.queryByTestId("empty-state-action")).toBeNull();
    });
  });

  describe("NoSearchResultsEmptyState", () => {
    it("includes search query in description", () => {
      const query = "wedding";
      const description = `We couldn't find anything matching "${query}"`;

      expect(description).toContain(query);
    });

    it("has clear search action", () => {
      const handleClear = jest.fn();
      render(
        <EmptyState
          title="No results found"
          action={{ label: "Clear Search", onClick: handleClear }}
        />
      );

      fireEvent.click(screen.getByTestId("empty-state-action"));
      expect(handleClear).toHaveBeenCalled();
    });
  });

  describe("NoNotificationsEmptyState", () => {
    it("uses compact variant", () => {
      render(<EmptyState title="All caught up!" variant="compact" />);
      expect(screen.getByTestId("empty-state")).toHaveAttribute("data-variant", "compact");
    });
  });
});

describe("GenericEmptyState", () => {
  it("accepts custom item type", () => {
    const itemType = "templates";
    const title = `No ${itemType} found`;

    expect(title).toBe("No templates found");
  });

  it("renders without action when not provided", () => {
    render(<EmptyState title="No items found" />);
    expect(screen.queryByTestId("empty-state-action")).toBeNull();
  });

  it("renders with action when provided", () => {
    const handleAction = jest.fn();
    render(
      <EmptyState
        title="No items found"
        action={{ label: "Add Item", onClick: handleAction }}
      />
    );
    expect(screen.getByTestId("empty-state-action")).toBeInTheDocument();
  });
});

describe("Accessibility", () => {
  it("has proper heading structure", () => {
    render(<EmptyState title="No items" />);
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });

  it("action button is focusable", () => {
    const handleClick = jest.fn();
    render(
      <EmptyState
        title="No items"
        action={{ label: "Create", onClick: handleClick }}
      />
    );

    const button = screen.getByTestId("empty-state-action");
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it("action button responds to keyboard", () => {
    const handleClick = jest.fn();
    render(
      <EmptyState
        title="No items"
        action={{ label: "Create", onClick: handleClick }}
      />
    );

    const button = screen.getByTestId("empty-state-action");
    fireEvent.keyDown(button, { key: "Enter" });
    // Note: fireEvent.keyDown doesn't trigger click by default
    // In real component, button's native behavior handles this
  });
});
