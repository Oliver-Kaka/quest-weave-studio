import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q");
  const courseId = searchParams.get("course");
  const year = searchParams.get("year");

  const { data: units, isLoading } = useQuery({
    queryKey: ["search-units", query, courseId, year],
    queryFn: async () => {
      let queryBuilder = supabase
        .from("units")
        .select(`
          *,
          courses (
            course_code,
            course_name
          )
        `);

      if (query) {
        queryBuilder = queryBuilder.or(`unit_code.ilike.%${query}%,unit_name.ilike.%${query}%`);
      }

      if (courseId) {
        queryBuilder = queryBuilder.eq("course_id", courseId);
      }

      if (year) {
        queryBuilder = queryBuilder.eq("year", parseInt(year));
      }

      const { data, error } = await queryBuilder.order("unit_code");
      if (error) throw error;
      return data;
    },
    enabled: !!(query || courseId),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Search Results</h1>
          <p className="text-muted-foreground">
            {query && `Searching for: "${query}"`}
            {courseId && year && ` in Year ${year}`}
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : units && units.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit: any) => (
              <Card key={unit.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <Badge variant="secondary">Year {unit.year}</Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{unit.unit_code}</CardTitle>
                  <CardDescription className="font-medium text-foreground">
                    {unit.unit_name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {unit.description || "No description available"}
                  </p>
                  {unit.courses && (
                    <p className="text-xs text-muted-foreground">
                      {unit.courses.course_code} - {unit.courses.course_name}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No units found matching your search.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SearchResults;
