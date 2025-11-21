import { Pagination } from '@shopify/hydrogen';
import * as React from 'react';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 */
export function PaginatedResourceSection<NodesType>({
  connection,
  children,
  resourcesClassName,
}: {
  connection: React.ComponentProps<typeof Pagination<NodesType>>['connection'];
  children: React.FunctionComponent<{node: NodesType; index: number}>;
  resourcesClassName?: string;
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        return (
          <div>
            {/* PreviousLink removed intentionally - we only support loading more at the moment */}
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}
            <div className="load-more-wrap">
              <NextLink className="load-more-btn" aria-label="Load more">
              {isLoading ? (
                <span className="load-btn-spinner" aria-hidden />
              ) : (
                <span className="load-btn">
                  <span className="load-btn-text">Load more</span>
                  <span className="load-btn-icon" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="block">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </span>
              )}
              </NextLink>
            </div>
          </div>
        );
      }}
    </Pagination>
  );
}