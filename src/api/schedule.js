// api.js
const baseURL = process.env.REACT_APP_BASE_URL;

// Fetch all schedules
export const fetchAllSchedules = async () => {
  try {
    const response = await fetch(`${baseURL}/api/schedule/all`, {
      method: "GET",
      credentials: "include", // Include credentials for session-based authentication
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error("Failed to fetch schedules.");
    }

    return result.data.schedules;
  } catch (error) {
    console.error("Error fetching schedules:", error);
    throw error;
  }
};

// Fetch schedule by time index
export const fetchScheduleByTimeIndex = async (timeIdx) => {
  try {
    const response = await fetch(`${baseURL}/api/schedule/${timeIdx}`, {
      method: "GET",
      credentials: "include", // Include credentials for session-based authentication
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        const error = await response.json();
        throw new Error(error.error.message || "Schedule not found.");
      }
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error("Failed to fetch schedule.");
    }

    return result.data.schedule;
  } catch (error) {
    console.error(`Error fetching schedule with timeIdx ${timeIdx}:`, error);
    throw error;
  }
};

// Create a new schedule
export const createSchedule = async (scheduleData) => {
  try {
    const response = await fetch(`${baseURL}/api/schedule`, {
      method: "POST",
      credentials: "include", // Include credentials for session-based authentication
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleData),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const error = await response.json();
        throw new Error(error.error.message || "Failed to create schedule.");
      }
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error("Failed to create schedule.");
    }

    return result.data.schedule;
  } catch (error) {
    console.error("Error creating schedule:", error);
    throw error;
  }
};

// Update an existing schedule
export const updateSchedule = async (scheduleData) => {
  try {
    const response = await fetch(`${baseURL}/api/schedule`, {
      method: "PUT",
      credentials: "include", // Include credentials for session-based authentication
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(scheduleData),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error("Failed to update schedule.");
    }

    return result.data.schedule;
  } catch (error) {
    console.error("Error updating schedule:", error);
    throw error;
  }
};

// Delete a schedule
export const deleteSchedule = async (title) => {
  try {
    const response = await fetch(`${baseURL}/api/schedule`, {
      method: "DELETE",
      credentials: "include", // Include credentials for session-based authentication
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        const error = await response.json();
        throw new Error(error.error.message || "Schedule not found.");
      }
      throw new Error(`Error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error("Failed to delete schedule.");
    }

    return result.data;
  } catch (error) {
    console.error("Error deleting schedule:", error);
    throw error;
  }
};
